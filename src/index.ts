import { createResponse } from './shared/response';
import { handlePlayer } from './api/players/handler';
import { handleServer } from './api/servers/handler';

// Allowed origins whitelist
const allowedProductionOrigins: string[] = ['https://mc-inspect.pages.dev', 'https://mc-inspect.buildbynik.dev'];
const allowedLocalOrigins: string[] = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'];

// Main handler and router
export default {
  async fetch(req, env): Promise<Response> {
    const origin = req.headers.get('Origin') || '';
    const apiKey = req.headers.get('X-API-Key') || '';

    const isProductionOrigin = allowedProductionOrigins.includes(origin);
    const isLocalOrigin = allowedLocalOrigins.includes(origin);

    // Handle preflight request
    if (req.method === 'OPTIONS') return createResponse({}, origin, 200, { 'Access-Control-Max-Age': '86400' });

    // Handle forbidden request (not production origin and not local origin with correct key)
    if (!isProductionOrigin && !(isLocalOrigin && apiKey === env.API_KEY)) return createResponse({ error: 'Forbidden' }, origin, 403);

    // Handle wrong request method
    if (req.method !== 'GET') return createResponse({ error: 'Method Not Allowed' }, origin, 405);

    // Api endpoint-url router
    const url = new URL(req.url);
    const path = url.pathname;
    const segments = path.split('/').filter((e) => e !== '');
    let route: string | null = segments[0];
    const param = segments[1];

    if (segments.length !== 2) {
      route = null;
    }

    switch (route) {
      case 'players':
        // Handle player request
        return handlePlayer(param, origin);

      case 'servers':
        // Handle server request
        return handleServer(param, origin);

      default:
        // Handle invalid request
        return createResponse({ error: 'Route Not Found' }, origin, 404);
    }
  },
} satisfies ExportedHandler<Env>;

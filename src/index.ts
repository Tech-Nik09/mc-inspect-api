import { createResponse } from './utils/response';
import { handlePlayer } from './api/players';
import { handleServer } from './api/servers';

// Main handler and router
export default {
  async fetch(req, env, ctx): Promise<Response> {
    const origin = req.headers.get('Origin') || '';
    const userAgent = env.USER_AGENT || 'mc-inspect-api/0.0.0';

    // Handle preflight request
    if (req.method === 'OPTIONS') return createResponse({}, origin, 200, { 'Access-Control-Max-Age': '86400' });

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
        return handlePlayer(req, ctx, param, origin, userAgent);

      case 'servers':
        // Handle server request
        return handleServer(req, ctx, param, origin, userAgent);

      default:
        // Handle invalid request
        return createResponse({ error: 'Route Not Found' }, origin, 404);
    }
  },
} satisfies ExportedHandler<Env>;

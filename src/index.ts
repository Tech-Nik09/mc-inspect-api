import { createResponse } from './shared/response';
import { handlePlayer } from './api/players/handler';
import { handleServer } from './api/servers/handler';

// Main handler and router
export default {
  async fetch(req, env, ctx): Promise<Response> {
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
        return handlePlayer(req, ctx, param, origin);

      case 'servers':
        // Handle server request
        return handleServer(req, ctx, param, origin);

      default:
        // Handle invalid request
        return createResponse({ error: 'Route Not Found' }, origin, 404);
    }
  },
} satisfies ExportedHandler<Env>;

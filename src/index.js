let origin = null;
const allowedOrigins = [
  'https://mc-inspect.pages.dev',
  'http://localhost:3000',
  'http://localhost:5500',
];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request) {
    origin = request.headers.get('Origin');
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Handle forbidden request
    if (!isAllowedOrigin) {
      return new Response('Forbidden', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Handle preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          ...corsHeaders(origin),
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Handle wrong request method
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': 'text/plain',
        },
      });
    }

    // Router
    const url = new URL(request.url);
    const path = url.pathname;
    const segments = path.split('/').filter((element) => element !== '');
    let route = segments[0];
    const param = segments[1];

    if (segments.length !== 2) {
      route = null;
    }

    switch (route) {
      case 'players':
        // Handle player request
        return handlePlayer(param);

      case 'servers':
        // Handle server request
        return handleServer(param);

      default:
        // Handle invalid request
        return handleNotFound();
    }
  },
};

function handleNotFound() {
  return new Response('Not Found', {
    status: 404,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'text/plain',
    },
  });
}

function handlePlayer(player) {
  return new Response(`Player: ${player}`, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function handleServer(server) {
  return new Response(`Server: ${server}`, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

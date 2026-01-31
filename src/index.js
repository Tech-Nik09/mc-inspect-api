const allowedOrigins = ['https://mc-inspect.pages.dev', 'http://localhost:3000'];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin');
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

    // Handle GET request
    return new Response('Hello from the api. :)', {
      status: 200,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
};

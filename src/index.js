let origin = null;
const allowedOrigins = ['https://mc-inspect.pages.dev', 'http://localhost:3000', 'http://localhost:5500'];

// Set CORS headers
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

    // Api endpoint-url router
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

// Send 404 response
function handleNotFound() {
  return new Response('Not Found', {
    status: 404,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'text/plain',
    },
  });
}

// Players api endpoint
async function handlePlayer(player) {
  try {
    // Fetch player uuid
    const uuidResponse = await fetch(`https://api.minetools.eu/uuid/${player}`);
    if (!uuidResponse.ok) {
      throw new Error(`[handlePlayer|${uuidResponse.status}] Error while fetching uuid`);
    }
    const uuidData = await uuidResponse.json();
    if (!uuidData.id) {
      throw new Error(`[handlePlayer|404] Player not found`);
    }
    const uuid = uuidData.id;

    // Fetch player profile
    const profileResponse = await fetch(`https://api.minetools.eu/profile/${uuid}`);
    if (!profileResponse.ok) {
      throw new Error(`[handlePlayer|${profileResponse.status}] Error while fetching profile`);
    }
    const profileData = await profileResponse.json();

    // Parse profile data
    const textureDataEncoded = profileData.raw.properties[0].value;
    const textureDataDecoded = JSON.parse(atob(textureDataEncoded));
    const playerModel = textureDataDecoded.textures.SKIN.metadata?.model === 'slim' ? 'slim' : 'wide';
    const capeUrl = textureDataDecoded.textures.CAPE?.url;
    const skinUrl = textureDataDecoded.textures.SKIN.url;
    const skinId = skinUrl.split('/').at(-1);
    const name = textureDataDecoded.profileName;

    // Create response object
    const responseData = {
      name,
      uuid,
      skinId,
      playerModel,
      skinUrl,
      capeUrl,
    };

    // Send response
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        ...corsHeaders(origin),
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    // Log error and send 404 response
    console.error(error);
    return handleNotFound();
  }
}

// Servers api endpoint
function handleServer(server) {
  return new Response(`Server: ${server}`, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=600',
    },
  });
}

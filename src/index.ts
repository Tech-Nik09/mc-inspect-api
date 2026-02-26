// Allowed origins whitelist
const allowedProductionOrigins: string[] = ['https://mc-inspect.pages.dev'];
const allowedLocalOrigins: string[] = ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Create response
function createResponse(body: object, origin: string, status: number, headers: { [key: string]: string } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
      'Content-Type': 'application/json',
    },
  });
}

export default {
  async fetch(request, env): Promise<Response> {
    const origin = request.headers.get('Origin') || '';
    const apiKey = request.headers.get('X-API-Key') || '';

    const isProductionOrigin = allowedProductionOrigins.includes(origin);
    const isLocalOrigin = allowedLocalOrigins.includes(origin);

    // Handle preflight request
    if (request.method === 'OPTIONS') return createResponse({}, origin, 200, { 'Access-Control-Max-Age': '86400' });

    // Handle forbidden request (not production origin and not local origin with correct key)
    if (!isProductionOrigin && !(isLocalOrigin && apiKey === env.API_KEY)) return createResponse({ error: 'Forbidden' }, origin, 403);

    // Handle wrong request method
    if (request.method !== 'GET') return createResponse({ error: 'Method Not Allowed' }, origin, 405);

    // Api endpoint-url router
    const url = new URL(request.url);
    const path = url.pathname;
    const segments = path.split('/').filter((element) => element !== '');
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
        return createResponse({ error: 'Not Found' }, origin, 404);
    }
  },
} satisfies ExportedHandler<Env>;

// Players api endpoint
async function handlePlayer(player: string, origin: string) {
  try {
    // Fetch player uuid
    const uuidResponse = await fetch(`https://api.minetools.eu/uuid/${player}`);
    if (!uuidResponse.ok) throw new Error(`[handlePlayer|${uuidResponse.status}] Error while fetching uuid`);

    const uuidData = await uuidResponse.json();
    if (!uuidData.id) throw new Error(`[handlePlayer|404] Player not found`);

    const uuid = uuidData.id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

    // Fetch player profile
    const profileResponse = await fetch(`https://api.minetools.eu/profile/${uuid}`);
    if (!profileResponse.ok) throw new Error(`[handlePlayer|${profileResponse.status}] Error while fetching profile`);

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

    return createResponse(responseData, origin, 200, { 'Cache-Control': 'public, max-age=86400' });
  } catch (error) {
    // Log error and send 404 response
    console.error(error);
    return createResponse({ error: 'Not Found' }, origin, 404);
  }
}

// Servers api endpoint
function handleServer(server: string, origin: string) {
  return createResponse({ server }, origin, 200, { 'Cache-Control': 'public, max-age=600' });
}

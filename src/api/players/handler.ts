import type { PreLookupData, ProfileData, TextureDataDecoded, ResponseData } from './types';
import { createResponse } from '../../shared/response';

// Players api endpoint
export async function handlePlayer(req: Request, ctx: ExecutionContext, player: string, origin: string): Promise<Response> {
  try {
    // Check whether response is present in cache
    const playersCache = await caches.open('playersCache');
    let res = await playersCache.match(req);
    if (res) return res;

    // Fetch player uuid
    const uuidCriteria = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|[0-9a-fA-F]{32})$/;
    if (!uuidCriteria.test(player)) {
      const preLookupResponse = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/name/${player}`);
      if (preLookupResponse.status === 404) return createResponse({ error: 'Player Not Found' }, origin, 404);
      if (!preLookupResponse.ok) throw new Error(`[handlePlayer|${preLookupResponse.status}] Error while fetching uuid`);

      const preLookupData: PreLookupData = await preLookupResponse.json();
      player = preLookupData.id;
    }

    // Fetch player profile
    const profileResponse = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${player}`);
    if (profileResponse.status === 204 || profileResponse.status === 400) return createResponse({ error: 'Player Not Found' }, origin, 404);
    if (!profileResponse.ok) throw new Error(`[handlePlayer|${profileResponse.status}] Error while fetching profile`);

    const profileData: ProfileData = await profileResponse.json();

    // Parse profile data
    const textureDataEncoded = profileData.properties[0].value;
    const textureDataDecoded: TextureDataDecoded = JSON.parse(atob(textureDataEncoded));
    const playerModel = textureDataDecoded.textures.SKIN.metadata?.model === 'slim' ? 'slim' : 'wide';
    const capeUrl = textureDataDecoded.textures.CAPE?.url;
    const skinUrl = textureDataDecoded.textures.SKIN.url;
    const skinId = skinUrl.split('/').at(-1)!;
    const name = textureDataDecoded.profileName;
    const uuid = textureDataDecoded.profileId.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

    // Create response object
    const responseData: ResponseData = {
      name,
      uuid,
      skinId,
      playerModel,
      skinUrl,
      capeUrl,
    };

    // Cache and return response
    res = createResponse(responseData, origin, 200, { 'Cache-Control': 'public, max-age=43200, s-maxage=86400' });
    ctx.waitUntil(playersCache.put(req, res.clone()));
    return res;
  } catch (err) {
    // Handle error
    console.error(err);
    return createResponse({ error: 'Internal Server Error' }, origin, 500);
  }
}

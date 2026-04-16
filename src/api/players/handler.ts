import type { UpstreamMojangPreData, UpstreamMojangProfileData, TextureDataDecoded, DownstreamData, UpstreamPlayerData } from './types';
import { createResponse } from '../../shared/response';

// Players api endpoint
export async function handlePlayer(req: Request, ctx: ExecutionContext, player: string, origin: string, userAgent: string): Promise<Response> {
  try {
    // Check whether response is present in cache
    const playersCache = await caches.open('playersCache');
    let res = await playersCache.match(req);
    if (res) return res;

    // Try upstream APIs
    const upstreamAPIs = [fetchMojang] as const;
    let upstreamData: UpstreamPlayerData = null;

    for (const upstreamAPI of upstreamAPIs) {
      try {
        upstreamData = await upstreamAPI(player, userAgent);
        if (!upstreamData) return createResponse({ error: 'Player Not Found' }, origin, 404);
        break;
      } catch (err) {
        console.warn(err);
      }
    }

    if (!upstreamData) throw new Error('[handlePlayer|500] No upstream API available');

    // Parse profile data
    const textureDataEncoded: string = upstreamData;
    const textureDataDecoded: TextureDataDecoded = JSON.parse(atob(textureDataEncoded));
    const playerModel = textureDataDecoded.textures.SKIN.metadata?.model === 'slim' ? 'slim' : 'wide';
    const capeUrl = textureDataDecoded.textures.CAPE?.url;
    const skinUrl = textureDataDecoded.textures.SKIN.url;
    const skinId = skinUrl.split('/').at(-1)!;
    const name = textureDataDecoded.profileName;
    const uuid = textureDataDecoded.profileId.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

    // Create response object
    const downstreamData: DownstreamData = {
      name,
      uuid,
      skinId,
      playerModel,
      skinUrl,
      capeUrl,
    };

    // Cache and return response
    res = createResponse(downstreamData, origin, 200, { 'Cache-Control': 'public, max-age=43200, s-maxage=86400' });
    ctx.waitUntil(playersCache.put(req, res.clone()));
    return res;
  } catch (err) {
    // Handle error
    console.error(err);
    return createResponse({ error: 'Internal server error' }, origin, 500);
  }
}

async function fetchMojang(player: string, userAgent: string): Promise<UpstreamPlayerData> {
  // Fetch player uuid
  const uuidCriteria = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|[0-9a-fA-F]{32})$/;
  if (!uuidCriteria.test(player)) {
    const preRes = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/name/${player}`, {
      headers: { 'User-Agent': userAgent },
    });
    if (preRes.status === 404) return null;
    if (!preRes.ok) throw new Error(`[fetchMojang|${preRes.status}] Error while fetching mojang api`);

    const preDat: UpstreamMojangPreData = await preRes.json();
    player = preDat.id;
  }

  // Fetch player profile
  const profileRes = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${player}`, {
    headers: { 'User-Agent': userAgent },
  });
  if (profileRes.status === 204 || profileRes.status === 400) return null;
  if (!profileRes.ok) throw new Error(`[fetchMojang|${profileRes.status}] Error while fetching mojang api`);

  const profileDat: UpstreamMojangProfileData = await profileRes.json();

  // Map and return textureDataEncoded
  return profileDat.properties[0].value;
}

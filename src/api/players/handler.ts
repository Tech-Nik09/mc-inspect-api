import type { UuidData, ProfileData, TextureDataDecoded, ResponseData } from './types';
import { createResponse } from '../../shared/response';

// Players api endpoint
export async function handlePlayer(player: string, origin: string): Promise<Response> {
  try {
    // Fetch player uuid
    const uuidResponse = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/name/${player}`);
    if (!uuidResponse.ok) throw new Error(`[handlePlayer|${uuidResponse.status}] Error while fetching uuid`);

    const uuidData: UuidData = await uuidResponse.json();
    if (!uuidData.id) return createResponse({ error: 'Player Not Found' }, origin, 404);

    const uuid = uuidData.id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

    // Fetch player profile
    const profileResponse = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);
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

    // Create response object
    const responseData: ResponseData = {
      name,
      uuid,
      skinId,
      playerModel,
      skinUrl,
      capeUrl,
    };

    return createResponse(responseData, origin, 200, { 'Cache-Control': 'public, max-age=86400' });
  } catch (err) {
    // Handle error
    console.error(err);
    return createResponse({ error: 'Internal Server Error' }, origin, 500);
  }
}

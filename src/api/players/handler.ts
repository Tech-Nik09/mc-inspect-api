import { UuidData, ProfileData, TextureDataDecoded } from './types.js';
import { createResponse } from '../../shared/response.js';

// Players api endpoint
export async function handlePlayer(player: string, origin: string) {
  try {
    // Fetch player uuid
    const uuidResponse = await fetch(`https://api.minetools.eu/uuid/${player}`);
    if (!uuidResponse.ok) throw new Error(`[handlePlayer|${uuidResponse.status}] Error while fetching uuid`);

    const uuidData: UuidData = await uuidResponse.json();
    if (!uuidData.id) throw new Error(`[handlePlayer|404] Player not found`);

    const uuid = uuidData.id.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');

    // Fetch player profile
    const profileResponse = await fetch(`https://api.minetools.eu/profile/${uuid}`);
    if (!profileResponse.ok) throw new Error(`[handlePlayer|${profileResponse.status}] Error while fetching profile`);

    const profileData: ProfileData = await profileResponse.json();

    // Parse profile data
    const textureDataEncoded = profileData.raw.properties[0].value;
    const textureDataDecoded: TextureDataDecoded = JSON.parse(atob(textureDataEncoded));
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

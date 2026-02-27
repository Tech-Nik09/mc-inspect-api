import { createResponse } from '../../shared/response.js';

// Servers api endpoint
export function handleServer(server: string, origin: string) {
  return createResponse({ server }, origin, 200, { 'Cache-Control': 'public, max-age=600' });
}

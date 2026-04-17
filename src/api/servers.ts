import { createResponse } from '../utils/response';

// Servers api endpoint
export async function handleServer(req: Request, ctx: ExecutionContext, server: string, origin: string, userAgent: string): Promise<Response> {
  try {
    return createResponse({ server }, origin, 200, { 'Cache-Control': 'public, max-age=600' });
  } catch (err) {
    // Handle error
    console.error(err);
    return createResponse({ error: 'Internal server error' }, origin, 500);
  }
}

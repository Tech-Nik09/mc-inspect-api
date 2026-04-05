import { createResponse } from '../../shared/response';

// Servers api endpoint
export async function handleServer(req: Request, ctx: ExecutionContext, server: string, origin: string): Promise<Response> {
  try {
    return createResponse({ server }, origin, 200, { 'Cache-Control': 'public, max-age=600' });
  } catch (err) {
    // Handle error
    console.error(err);
    return createResponse({ error: 'Internal Server Error' }, origin, 500);
  }
}

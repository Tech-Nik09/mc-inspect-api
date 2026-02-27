// Create response
export function createResponse(body: object, origin: string, status: number, headers: { [key: string]: string } = {}) {
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

export async function onRequest() {
  return new Response(JSON.stringify({
    status: 'ok',
    platform: 'ZeBar by ZENSTRO',
    domain: 'zebar.zenstro.space',
    timestamp: new Date().toISOString()
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

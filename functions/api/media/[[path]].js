const B2_KEY_ID = '0ce468f0de3b';
const B2_APP_KEY = '00573003ad5b0c4f8d2773a3e1d8f1a9a5d447a63e';
const B2_BUCKET_NAME = 'zebar-storage';

async function getB2Auth() {
  const basicAuth = btoa(`${B2_KEY_ID}:${B2_APP_KEY}`);
  const res = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
    headers: { Authorization: `Basic ${basicAuth}` },
  });
  if (!res.ok) throw new Error('B2 Auth failed');
  return res.json();
}

export async function onRequestGet({ params }) {
  const pathArray = params.path;
  if (!pathArray || pathArray.length === 0) {
    return new Response('File path required', { status: 400 });
  }

  const filePath = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;

  try {
    const auth = await getB2Auth();
    const fileUrl = `${auth.apiInfo.storageApi.downloadUrl}/file/${B2_BUCKET_NAME}/${filePath}`;

    const b2Res = await fetch(fileUrl, {
      headers: {
        Authorization: auth.authorizationToken,
      },
    });

    if (!b2Res.ok) {
      return new Response('Media file not found in B2', { status: b2Res.status });
    }

    const headers = new Headers();
    headers.set('Content-Type', b2Res.headers.get('content-type') || 'application/octet-stream');
    const cl = b2Res.headers.get('content-length');
    if (cl) headers.set('Content-Length', cl);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Accept-Ranges', 'bytes');

    return new Response(b2Res.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error('B2 streaming error:', err);
    return new Response('Streaming error', { status: 500 });
  }
}

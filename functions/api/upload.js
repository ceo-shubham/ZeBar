const B2_KEY_ID = '0ce468f0de3b';
const B2_APP_KEY = '00573003ad5b0c4f8d2773a3e1d8f1a9a5d447a63e';
const B2_BUCKET_ID = '102cfe2426284fc0ad1e031b';
const B2_BUCKET_NAME = 'zebar-storage';

async function getB2Auth() {
  const basicAuth = btoa(`${B2_KEY_ID}:${B2_APP_KEY}`);
  const res = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
    headers: { Authorization: `Basic ${basicAuth}` },
  });
  if (!res.ok) throw new Error('B2 Auth failed');
  return res.json();
}

export async function onRequestPost({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const auth = await getB2Auth();
    const apiUrl = auth.apiInfo.storageApi.apiUrl;
    const token = auth.authorizationToken;

    // Get upload URL
    const upRes = await fetch(`${apiUrl}/b2api/v3/b2_get_upload_url`, {
      method: 'POST',
      headers: { Authorization: token },
      body: JSON.stringify({ bucketId: B2_BUCKET_ID }),
    });

    if (!upRes.ok) {
      throw new Error('Failed to get B2 upload URL');
    }

    const upData = await upRes.json();
    const arrayBuffer = await file.arrayBuffer();
    const safeFilename = `zebar/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Calculate SHA1 via Web Crypto
    const hashBuffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha1 = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const b2UploadRes = await fetch(upData.uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: upData.authorizationToken,
        'X-Bz-File-Name': encodeURIComponent(safeFilename),
        'Content-Type': file.type || 'application/octet-stream',
        'Content-Length': arrayBuffer.byteLength.toString(),
        'X-Bz-Content-Sha1': sha1,
      },
      body: arrayBuffer,
    });

    if (!b2UploadRes.ok) {
      const errText = await b2UploadRes.text();
      throw new Error(`B2 file upload failed: ${errText}`);
    }

    const uploadedFileData = await b2UploadRes.json();
    const mediaProxyUrl = `/api/media/${uploadedFileData.fileName}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: mediaProxyUrl,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storage: 'backblaze_b2',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Upload handler error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface B2AuthData {
  token: string;
  apiUrl: string;
  downloadUrl: string;
  accountId: string;
  expiresAt: number;
}

let cachedAuth: B2AuthData | null = null;

async function getB2Auth(): Promise<B2AuthData | null> {
  const keyId = process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;

  if (!keyId || !appKey) return null;

  if (cachedAuth && cachedAuth.expiresAt > Date.now()) {
    return cachedAuth;
  }

  try {
    const basicAuth = Buffer.from(`${keyId}:${appKey}`).toString('base64');
    const res = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
      headers: { Authorization: `Basic ${basicAuth}` },
    });

    if (!res.ok) {
      console.error('B2 auth failed:', await res.text());
      return null;
    }

    const data = await res.json();
    cachedAuth = {
      token: data.authorizationToken,
      apiUrl: data.apiInfo?.storageApi?.apiUrl || 'https://api005.backblazeb2.com',
      downloadUrl: data.apiInfo?.storageApi?.downloadUrl || 'https://f005.backblazeb2.com',
      accountId: data.accountId,
      expiresAt: Date.now() + 20 * 60 * 60 * 1000, // 20 hours
    };

    return cachedAuth;
  } catch (err) {
    console.error('B2 authorization exception:', err);
    return null;
  }
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; storageType: 'backblaze_b2' | 'local' }> {
  const bucketName = process.env.B2_BUCKET_NAME || 'zebar-storage';
  const bucketId = process.env.B2_BUCKET_ID || '102cfe2426284fc0ad1e031b';

  // 1. Try Backblaze B2 Native API
  const auth = await getB2Auth();
  if (auth) {
    try {
      // Get upload URL for bucket
      const uploadUrlRes = await fetch(`${auth.apiUrl}/b2api/v3/b2_get_upload_url`, {
        method: 'POST',
        headers: { Authorization: auth.token },
        body: JSON.stringify({ bucketId }),
      });

      if (uploadUrlRes.ok) {
        const uploadUrlData = await uploadUrlRes.json();
        const safeName = `zebar/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');

        const uploadRes = await fetch(uploadUrlData.uploadUrl, {
          method: 'POST',
          headers: {
            Authorization: uploadUrlData.authorizationToken,
            'X-Bz-File-Name': encodeURIComponent(safeName),
            'Content-Type': mimeType || 'application/octet-stream',
            'Content-Length': buffer.length.toString(),
            'X-Bz-Content-Sha1': sha1,
          },
          body: new Uint8Array(buffer),
        });

        if (uploadRes.ok) {
          const fileData = await uploadRes.json();
          // Public URL structure
          const fileUrl = `${auth.downloadUrl}/file/${bucketName}/${fileData.fileName}`;
          return { url: fileUrl, storageType: 'backblaze_b2' };
        } else {
          console.error('B2 upload call failed:', await uploadRes.text());
        }
      }
    } catch (err) {
      console.error('Backblaze B2 upload error, falling back to local storage:', err);
    }
  }

  // 2. Fallback to local storage
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = path.join(uploadsDir, safeFilename);
  fs.writeFileSync(filePath, buffer);

  return {
    url: `/uploads/${safeFilename}`,
    storageType: 'local',
  };
}

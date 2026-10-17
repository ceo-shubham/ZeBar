import { NextRequest, NextResponse } from 'next/server';

interface B2AuthData {
  token: string;
  apiUrl: string;
  downloadUrl: string;
  accountId: string;
  expiresAt: number;
}

let cachedAuth: B2AuthData | null = null;

async function getB2Auth(): Promise<B2AuthData | null> {
  const keyId = process.env.B2_KEY_ID;
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

    if (!res.ok) return null;

    const data = await res.json();
    cachedAuth = {
      token: data.authorizationToken,
      apiUrl: data.apiInfo?.storageApi?.apiUrl || 'https://api005.backblazeb2.com',
      downloadUrl: data.apiInfo?.storageApi?.downloadUrl || 'https://f005.backblazeb2.com',
      accountId: data.accountId,
      expiresAt: Date.now() + 20 * 60 * 60 * 1000,
    };

    return cachedAuth;
  } catch (err) {
    console.error('B2 auth error in media stream:', err);
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (!path || path.length === 0) {
    return new NextResponse('File path required', { status: 400 });
  }

  const filePath = path.join('/');
  const bucketName = process.env.B2_BUCKET_NAME || 'zebar-storage';
  const auth = await getB2Auth();

  if (!auth) {
    return new NextResponse('Storage service unavailable', { status: 503 });
  }

  try {
    const fileUrl = `${auth.downloadUrl}/file/${bucketName}/${filePath}`;
    
    // Fetch file from Backblaze B2 using authorized token
    const b2Res = await fetch(fileUrl, {
      headers: {
        Authorization: auth.token,
      },
    });

    if (!b2Res.ok) {
      console.error(`B2 media fetch failed with status ${b2Res.status} for ${filePath}`);
      return new NextResponse('Media file not found or access denied', { status: b2Res.status });
    }

    const contentType = b2Res.headers.get('content-type') || 'application/octet-stream';
    const contentLength = b2Res.headers.get('content-length');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Accept-Ranges', 'bytes');

    // Return the response stream directly so browser can play audio / show image
    return new NextResponse(b2Res.body, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    console.error('Error streaming media from B2:', err);
    return new NextResponse('Internal Media Streaming Error', { status: 500 });
  }
}

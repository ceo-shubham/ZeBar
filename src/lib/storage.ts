import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

function getS3Client(): S3Client | null {
  const keyId = process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;
  const endpoint = process.env.B2_ENDPOINT; // e.g. 'https://s3.us-west-004.backblazeb2.com'
  const region = process.env.B2_REGION || 'us-west-004';

  if (!keyId || !appKey || !endpoint) {
    return null;
  }

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: keyId,
      secretAccessKey: appKey,
    },
  });
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ url: string; storageType: 'backblaze_b2' | 'local' }> {
  const s3 = getS3Client();
  const bucketName = process.env.B2_BUCKET_NAME;

  // 1. Try Backblaze B2 if configured
  if (s3 && bucketName) {
    try {
      const sanitizedName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `zebar/${sanitizedName}`,
        Body: buffer,
        ContentType: mimeType,
      });

      await s3.send(command);

      // Construct public URL
      const customPrefix = process.env.B2_PUBLIC_URL_PREFIX;
      let fileUrl = '';
      if (customPrefix) {
        fileUrl = `${customPrefix.replace(/\/$/, '')}/zebar/${sanitizedName}`;
      } else {
        const endpoint = process.env.B2_ENDPOINT?.replace(/^https?:\/\//, '');
        fileUrl = `https://${bucketName}.${endpoint}/zebar/${sanitizedName}`;
      }

      return { url: fileUrl, storageType: 'backblaze_b2' };
    } catch (err) {
      console.error('Backblaze B2 upload error, falling back to local storage:', err);
    }
  }

  // 2. Fallback to local uploads directory
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

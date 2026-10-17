import QRCode from 'qrcode';
import { QRSettings } from '@/types';

export interface GenerateQROptions {
  content: string;
  settings?: Partial<QRSettings>;
  logoUrl?: string;
}

export async function generateQRDataUrl(options: GenerateQROptions): Promise<string> {
  const { content, settings } = options;

  const eccLevel = options.logoUrl ? 'H' : (settings?.eccLevel || 'M');
  const fgColor = settings?.fgColor || '#000000';
  const bgColor = settings?.bgColor || '#ffffff';
  const width = settings?.size || 512;

  try {
    const dataUrl = await QRCode.toDataURL(content, {
      errorCorrectionLevel: eccLevel,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      width,
      margin: 2,
    });

    return dataUrl;
  } catch (err) {
    console.error('QR code generation failed:', err);
    throw err;
  }
}

export async function generateQRSvg(options: GenerateQROptions): Promise<string> {
  const { content, settings } = options;
  const eccLevel = options.logoUrl ? 'H' : (settings?.eccLevel || 'M');
  const fgColor = settings?.fgColor || '#000000';
  const bgColor = settings?.bgColor || '#ffffff';

  return QRCode.toString(content, {
    type: 'svg',
    errorCorrectionLevel: eccLevel,
    color: {
      dark: fgColor,
      light: bgColor,
    },
    margin: 2,
  });
}

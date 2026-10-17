import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/lib/auth';
import { createQR, getUserQRs } from '@/lib/db';
import { generateQRDataUrl } from '@/lib/qr';
import { QRType, QRSettings } from '@/types';

export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const qrs = getUserQRs(user.id);
  return NextResponse.json({ qrs });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to generate and save QR codes' }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      title,
      content,
      fileUrl,
      fileName,
      fileSize,
      logoUrl,
      settings = { fgColor: '#000000', bgColor: '#ffffff', eccLevel: 'H', size: 512 },
      clientGeneratedQrDataUrl,
    } = body;

    if (!type || !['text', 'url', 'mp3', 'image'].includes(type)) {
      return NextResponse.json({ error: 'Invalid QR code type' }, { status: 400 });
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Determine target content encoded in the QR code
    const origin = req.nextUrl.origin;
    let finalEncodedContent = content || '';

    // Generate temporary ID to use for view URL if needed
    const tempId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (type === 'mp3' || type === 'image') {
      if (!fileUrl) {
        return NextResponse.json({ error: `File URL is required for ${type} QR codes` }, { status: 400 });
      }
      finalEncodedContent = `${origin}/view/${tempId}`;
    } else if (type === 'url') {
      if (!content || !content.startsWith('http')) {
        return NextResponse.json({ error: 'Valid URL starting with http:// or https:// is required' }, { status: 400 });
      }
      finalEncodedContent = content.trim();
    } else if (type === 'text') {
      if (!content?.trim()) {
        return NextResponse.json({ error: 'Text content cannot be empty' }, { status: 400 });
      }
      finalEncodedContent = content.trim();
    }

    // Use client rendered canvas data URL (which already composites custom center logo cleanly)
    // or generate server-side if not provided
    let qrDataUrl = clientGeneratedQrDataUrl;
    if (!qrDataUrl) {
      qrDataUrl = await generateQRDataUrl({
        content: finalEncodedContent,
        settings,
        logoUrl,
      });
    }

    const newQR = createQR({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      type: type as QRType,
      title: title.trim(),
      content: finalEncodedContent,
      fileUrl,
      fileName,
      fileSize,
      logoUrl,
      qrDataUrl,
      settings: settings as QRSettings,
    });

    return NextResponse.json({
      success: true,
      qr: newQR,
    });
  } catch (err: unknown) {
    console.error('QR creation error:', err);
    const message = err instanceof Error ? err.message : 'Failed to create QR code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/lib/auth';
import { getQRById, deleteQR } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const isPublicScan = req.nextUrl.searchParams.get('public') === '1';

  const qr = getQRById(id, isPublicScan);
  if (!qr) {
    return NextResponse.json({ error: 'QR Code not found' }, { status: 404 });
  }

  return NextResponse.json({ qr });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isAdmin = user.role === 'VIP_OWNER';
  const success = deleteQR(id, user.id, isAdmin);

  if (!success) {
    return NextResponse.json({ error: 'QR Code not found or unauthorized' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

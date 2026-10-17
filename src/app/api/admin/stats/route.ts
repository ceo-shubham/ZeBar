import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/lib/auth';
import { getPlatformStats } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user || user.role !== 'VIP_OWNER') {
    return NextResponse.json({ error: 'Access restricted to VIP Owner' }, { status: 403 });
  }

  const stats = getPlatformStats();
  return NextResponse.json({ stats });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/lib/auth';
import { searchUsers, getAllUsers, getUserQRs, getUserByEmail } from '@/lib/db';

export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user || user.role !== 'VIP_OWNER') {
    return NextResponse.json({ error: 'Access restricted to VIP Owner (ceo.shubhampathak@gmail.com)' }, { status: 403 });
  }

  const search = req.nextUrl.searchParams.get('q') || '';
  const inspectEmail = req.nextUrl.searchParams.get('inspect') || '';

  const users = search ? searchUsers(search) : getAllUsers();

  let inspectedHistory = null;
  let inspectedUser = null;

  if (inspectEmail) {
    inspectedUser = getUserByEmail(inspectEmail);
    inspectedHistory = getUserQRs(inspectEmail);
  }

  return NextResponse.json({
    users,
    inspectedUser,
    inspectedHistory,
  });
}

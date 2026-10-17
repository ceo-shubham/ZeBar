import { NextRequest, NextResponse } from 'next/server';
import { upsertUser } from '@/lib/db';
import { createSessionToken, COOKIE_NAME, getGoogleOAuthUrl } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const origin = req.nextUrl.origin;

    // Check if requesting Google OAuth URL
    if (body.action === 'get_google_url') {
      const url = getGoogleOAuthUrl(origin);
      return NextResponse.json({ url });
    }

    // Direct / Dev login (supported for initial setup and testing)
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() || email?.split('@')[0];
    const avatar = body.avatar || '';

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const { user, isFirstLogin } = upsertUser(email, name, avatar);
    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user,
      isFirstLogin,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

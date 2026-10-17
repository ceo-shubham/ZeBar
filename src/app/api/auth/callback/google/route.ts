import { NextRequest, NextResponse } from 'next/server';
import { exchangeGoogleCodeForUser, createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { upsertUser } from '@/lib/db';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const origin = req.nextUrl.origin;

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error || 'Authentication cancelled')}`);
  }

  try {
    const googleProfile = await exchangeGoogleCodeForUser(code, origin);
    if (!googleProfile) {
      return NextResponse.redirect(`${origin}/login?error=Failed to retrieve Google profile`);
    }

    const { user } = upsertUser(googleProfile.email, googleProfile.name, googleProfile.avatar);
    const token = await createSessionToken(user);

    const redirectUrl = user.role === 'VIP_OWNER' ? `${origin}/vip` : `${origin}/dashboard`;
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(`${origin}/login?error=Google authentication failed`);
  }
}

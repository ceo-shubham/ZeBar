import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { User } from '@/types';
import { getUserByEmail, upsertUser, OWNER_EMAIL } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zebar-secret-key-zenstro-2026-super-secure'
);

export const COOKIE_NAME = 'zebar_session';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'USER' | 'VIP_OWNER';
}

export async function createSessionToken(user: User): Promise<string> {
  return await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.email) return null;

  return getUserByEmail(payload.email);
}

export async function getSessionUserFromRequest(req: NextRequest): Promise<User | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.email) return null;

  return getUserByEmail(payload.email);
}

// Google OAuth Helpers
export function getGoogleOAuthUrl(origin: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return '';
  }

  const redirectUri = `${origin}/api/auth/callback/google`;
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function exchangeGoogleCodeForUser(code: string, origin: string): Promise<{ email: string; name: string; avatar: string } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const redirectUri = `${origin}/api/auth/callback/google`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error('Failed to get Google access token:', tokenData);
    return null;
  }

  const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profile = await userinfoRes.json();
  if (!profile.email) return null;

  return {
    email: profile.email,
    name: profile.name || profile.given_name || profile.email.split('@')[0],
    avatar: profile.picture || '',
  };
}

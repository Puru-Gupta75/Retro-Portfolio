import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SYNC_SECRET || 'fallback-secret-change-me'
);
const COOKIE_NAME = 'amber_admin_token';

export interface AdminSession {
  username: string;
}

/**
 * Creates a signed HttpOnly JWT session cookie.
 * Called after successful credential verification.
 */
export async function createSession(username: string): Promise<void> {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 2, // 2 hours
    path: '/',
  });
}

/**
 * Verifies the session cookie and returns the admin session payload.
 * Returns null if the token is missing, invalid, or expired.
 */
export async function verifySession(req: NextRequest): Promise<AdminSession | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const username = payload.username as string | undefined;
    if (!username) return null;
    return { username };
  } catch {
    return null;
  }
}

/**
 * Deletes the session cookie (logout).
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

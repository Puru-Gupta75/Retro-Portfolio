import { NextResponse } from 'next/server';
import { db } from '@/utils/firestore';
import { comparePasswords } from '@/lib/admin/hash';
import { createSession } from '@/lib/admin/auth';

// --- Brute-force rate limiting: 10 attempts per IP per 15 minutes ---
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }

  if (entry.count >= LOGIN_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const { username: rawUser, password: rawPass } = await req.json();
    const username = rawUser.trim();
    const password = rawPass.trim();

    // 1. Fetch admin config from Firestore
    const adminRef = db.collection('internal').doc('config');
    const doc = await adminRef.get();

    if (!doc.exists) {
      console.error('[ADMIN_AUTH] FAIL: /internal/config document missing');
      return NextResponse.json({ error: 'System not initialized' }, { status: 500 });
    }

    const data = doc.data()!;
    const adminUser = data.adminUser;
    const adminPasswordHash = data.adminPasswordHash;

    if (!adminUser || !adminPasswordHash) {
      console.error('[ADMIN_AUTH] FAIL: Missing adminUser or adminPasswordHash in Firestore');
      return NextResponse.json({ error: 'System configuration invalid' }, { status: 500 });
    }

    // 2. Verify credentials
    const userMatches = username === adminUser;
    const passMatches = await comparePasswords(password, adminPasswordHash);

    if (!userMatches || !passMatches) {
      console.warn(`[ADMIN_AUTH] 401: Invalid credentials for user: ${username}`);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Create HttpOnly Session
    await createSession(username);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Login failed', message: error.message }, { status: 500 });
  }
}

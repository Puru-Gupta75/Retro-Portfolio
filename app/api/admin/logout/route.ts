import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  (await cookies()).set('amber_admin_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    expires: new Date(0), 
  });

  return NextResponse.json({ success: true, message: 'SESSION_TERMINATED' });
}

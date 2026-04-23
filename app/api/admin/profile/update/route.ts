import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firestore';
import { verifySession } from '@/lib/admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { writeGuard } from '@/lib/safety/writeGuard';
import { safetyLogger } from '@/lib/safety/logger';

const PROFILE_DOC = db.collection('profile').doc('main');

export async function PATCH(req: NextRequest) {
  try {
    // 1. Verify admin session
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { updates } = await req.json();

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Missing updates payload' }, { status: 400 });
    }

    // 2. Whitelist-filter: only manual profile fields pass through
    const filteredUpdates = writeGuard.filterAdminProfilePayload(updates);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid manual profile fields provided' },
        { status: 400 }
      );
    }

    // 3. Upsert profile document — merge:true ensures we never overwrite
    //    fields not included in this update
    await PROFILE_DOC.set(
      {
        ...filteredUpdates,
        lastModifiedAt: FieldValue.serverTimestamp(),
        modifiedBy: session.username,
      },
      { merge: true }
    );

    await safetyLogger.action('Admin profile update', {
      fields: Object.keys(filteredUpdates),
      admin: session.username,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    await safetyLogger.error('Admin profile update failure', error);
    return NextResponse.json(
      { error: 'Update failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/profile/update
 * Returns the current profile document for the admin editor.
 * Requires a valid admin session.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doc = await PROFILE_DOC.get();
    const data = doc.exists ? doc.data() : {};

    return NextResponse.json(data ?? {});
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch profile', message: error.message },
      { status: 500 }
    );
  }
}

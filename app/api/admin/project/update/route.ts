import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firestore';
import { verifySession } from '@/lib/admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { writeGuard } from '@/lib/safety/writeGuard';
import { safetyLogger } from '@/lib/safety/logger';

export async function PATCH(req: NextRequest) {
  try {
    // 1. Verify admin session
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, updates } = await req.json();

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid project ID' }, { status: 400 });
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Missing updates payload' }, { status: 400 });
    }

    // 2. Whitelist-filter: only manual project fields pass through.
    //    GitHub fields are silently dropped — admin cannot overwrite them.
    const filteredUpdates = writeGuard.filterAdminProjectPayload(updates);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid manual fields provided' },
        { status: 400 }
      );
    }

    // 3. Update Firestore — use update() not set() to preserve all other fields
    const docRef = db.collection('projects').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    await docRef.update({
      ...filteredUpdates,
      lastModifiedAt: FieldValue.serverTimestamp(),
      modifiedBy: session.username,
    });

    await safetyLogger.action(`Admin project update: ${id}`, {
      fields: Object.keys(filteredUpdates),
      admin: session.username,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    await safetyLogger.error(`Admin project update failure`, error);
    return NextResponse.json(
      { error: 'Update failed', message: error.message },
      { status: 500 }
    );
  }
}

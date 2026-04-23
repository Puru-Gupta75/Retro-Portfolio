import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firestore';
import { verifySession } from '@/lib/admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { safetyLogger } from '@/lib/safety/logger';

const ALLOWED_DOCS = [
  'identity',
  'skills',
  'experience',
  'education',
  'achievements',
  'uplink',
] as const;

type AllowedDoc = (typeof ALLOWED_DOCS)[number];

/**
 * GET /api/admin/site-config?doc=identity
 * Returns a single siteConfig document. Requires admin session.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const doc = req.nextUrl.searchParams.get('doc') as AllowedDoc | null;
    if (!doc || !ALLOWED_DOCS.includes(doc)) {
      return NextResponse.json({ error: 'Invalid or missing doc param' }, { status: 400 });
    }

    const snap = await db.collection('siteConfig').doc(doc).get();
    return NextResponse.json(snap.exists ? snap.data() : {});
  } catch (error: any) {
    return NextResponse.json({ error: 'Fetch failed', message: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/site-config
 * Body: { doc: AllowedDoc, updates: object }
 * Merges updates into the specified siteConfig document.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { doc, updates } = body as { doc: AllowedDoc; updates: Record<string, any> };

    if (!doc || !ALLOWED_DOCS.includes(doc)) {
      return NextResponse.json({ error: 'Invalid or missing doc param' }, { status: 400 });
    }
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Missing updates payload' }, { status: 400 });
    }

    // statusMsgs and errors on the uplink doc are manual-edit-only — strip them from API writes
    if (doc === 'uplink') {
      delete updates.statusMsgs;
      delete updates.errors;
    }

    await db.collection('siteConfig').doc(doc).set(
      { ...updates, lastModifiedAt: FieldValue.serverTimestamp(), modifiedBy: session.username },
      { merge: true }
    );

    await safetyLogger.action(`Admin siteConfig update: ${doc}`, {
      fields: Object.keys(updates),
      admin: session.username,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    await safetyLogger.error('Admin siteConfig update failure', error);
    return NextResponse.json({ error: 'Update failed', message: error.message }, { status: 500 });
  }
}

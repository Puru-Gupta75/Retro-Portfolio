import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/admin/auth';
import { db } from '@/utils/firestore';

/**
 * GET /api/admin/sync
 * Returns the most recent sync record from syncHistory.
 */
export async function GET(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snap = await db
      .collection('syncHistory')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ lastHandshake: null });
    }

    const doc = snap.docs[0].data();
    const timestamp = doc.timestamp?.toDate?.()?.toISOString() ?? null;

    return NextResponse.json({
      lastHandshake: {
        timestamp,
        duration: doc.duration ?? null,
        itemsProcessed: doc.itemsProcessed ?? null,
        activitiesCreated: doc.activitiesCreated ?? null,
        type: doc.type ?? null,
        status: doc.status ?? null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fetch failed', message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/sync
 * Admin-authenticated proxy that triggers the sync engine.
 * This keeps ADMIN_SYNC_SECRET server-side only — never exposed to the client.
 */
export async function POST(req: NextRequest) {
  // 1. Verify admin session
  const session = await verifySession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const syncSecret = process.env.ADMIN_SYNC_SECRET;
  if (!syncSecret) {
    return NextResponse.json({ error: 'Sync not configured' }, { status: 500 });
  }

  // 2. Forward to the sync engine with the server-side secret
  const syncUrl = new URL('/api/sync', req.url);

  const syncRes = await fetch(syncUrl.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${syncSecret}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await syncRes.json();

  if (!syncRes.ok) {
    return NextResponse.json(data, { status: syncRes.status });
  }

  return NextResponse.json(data);
}

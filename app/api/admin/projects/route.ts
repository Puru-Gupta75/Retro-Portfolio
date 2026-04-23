import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firestore';
import { verifySession } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/projects
 * Returns ALL projects from Firestore (including hidden ones) for the admin editor.
 * Requires a valid admin session — never exposed to public.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const snapshot = await db.collection('projects').get();

    const projects = snapshot.docs.map((doc) => ({
      ...doc.data(),
      repoId: doc.id,
    }));

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch projects', message: error.message },
      { status: 500 }
    );
  }
}

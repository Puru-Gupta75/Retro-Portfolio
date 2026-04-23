import { NextResponse } from 'next/server';
import { db } from '@/utils/firestore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.get();
    
    const projects = snapshot.docs.map(doc => ({
      ...doc.data(),
      repoId: doc.id
    }));

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

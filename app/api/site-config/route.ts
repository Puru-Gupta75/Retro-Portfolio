import { NextResponse } from 'next/server';
import { db } from '@/utils/firestore';

export const dynamic = 'force-dynamic';

/**
 * GET /api/site-config
 * Returns all static site configuration from Firestore siteConfig collection.
 * Fetches all documents in parallel and returns them as a single merged object.
 */
export async function GET() {
  try {
    const siteConfig = db.collection('siteConfig');

    const [
      identitySnap,
      navigationSnap,
      systemStatsSnap,
      skillsSnap,
      experienceSnap,
      educationSnap,
      achievementsSnap,
      uplinkSnap,
      labModulesSnap,
    ] = await Promise.all([
      siteConfig.doc('identity').get(),
      siteConfig.doc('navigation').get(),
      siteConfig.doc('systemStats').get(),
      siteConfig.doc('skills').get(),
      siteConfig.doc('experience').get(),
      siteConfig.doc('education').get(),
      siteConfig.doc('achievements').get(),
      siteConfig.doc('uplink').get(),
      siteConfig.doc('labModules').get(),
    ]);

    return NextResponse.json({
      identity: identitySnap.data() ?? null,
      navigation: navigationSnap.data() ?? null,
      systemStats: systemStatsSnap.data() ?? null,
      skills: skillsSnap.data() ?? null,
      experience: experienceSnap.data() ?? null,
      education: educationSnap.data() ?? null,
      achievements: achievementsSnap.data() ?? null,
      uplink: uplinkSnap.data() ?? null,
      labModules: labModulesSnap.data() ?? null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch site config', message: error.message },
      { status: 500 }
    );
  }
}

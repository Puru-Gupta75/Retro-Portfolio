import { NextResponse } from 'next/server';
import { fetchUserRepos, fetchLatestCommit, fetchRepoEvents } from '@/lib/sync/fetch';
import { transformRepo } from '@/lib/sync/transform';
import { transformEvent } from '@/lib/sync/transformActivity';
import { storeProject, storeActivities } from '@/lib/sync/store';
import { hasApiBudget } from '@/utils/github';
import { db } from '@/utils/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import { safetyLogger } from '@/lib/safety/logger';
import { errorHandler } from '@/lib/safety/errorHandler';

export const dynamic = 'force-dynamic';

/**
 * Main Sync Engine Entry Point
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  const syncId = `sync_${startTime}`;
  
  return await errorHandler.wrap(async () => {
    // 1. Authorization & Trigger Check
    const authHeader = req.headers.get('authorization');
    const isCron = req.headers.get('x-github-event') === 'schedule';
    const isAdmin = authHeader === `Bearer ${process.env.ADMIN_SYNC_SECRET}`;

    if (!isAdmin && !isCron) {
      await safetyLogger.warn('Unauthorized sync attempt detected');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate Limit Check
    if (!(await hasApiBudget())) {
      await safetyLogger.error('Sync aborted: GitHub API budget exhausted');
      return NextResponse.json({ error: 'GitHub API budget exhausted' }, { status: 429 });
    }

    // 3. Orchestrate Pipeline
    const repos = await fetchUserRepos();
    let itemsProcessed = 0;
    let activitiesCreated = 0;
    let apiCallsUsed = 1;

    for (const repo of repos) {
      // Selective Fetch Strategy
      let latestCommitDate = null;
      if (itemsProcessed < 15) { // Slightly increased budget
        const commit = await fetchLatestCommit(repo.owner.login, repo.name);
        latestCommitDate = commit?.commit?.committer?.date || null;
        apiCallsUsed++;

        const events = await fetchRepoEvents(repo.owner.login, repo.name);
        const activities = events
          .map(e => transformEvent(e, repo.id.toString(), repo.html_url))
          .filter((a): a is NonNullable<typeof a> => a !== null);
        activitiesCreated += await storeActivities(activities);
        apiCallsUsed++;
      }

      const projectData = transformRepo(repo, latestCommitDate);
      await storeProject(projectData);
      itemsProcessed++;
    }

    // 4. Audit Logging
    const duration = Date.now() - startTime;
    await db.collection('syncHistory').doc(syncId).set({
      syncId,
      type: isAdmin ? 'ADMIN' : 'CRON',
      status: 'SUCCESS',
      duration,
      itemsProcessed,
      activitiesCreated,
      apiCallsUsed,
      timestamp: FieldValue.serverTimestamp(),
    });

    await safetyLogger.action(`Sync completed: ${itemsProcessed} projects, ${activitiesCreated} activities.`);

    return NextResponse.json({ 
      success: true, 
      syncId, 
      itemsProcessed, 
      activitiesCreated, 
      duration 
    });

  }, 'SYNC_ENGINE', NextResponse.json({ error: 'Sync failed' }, { status: 500 }));
}

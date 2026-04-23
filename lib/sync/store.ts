import { db, createActivityIdempotent } from '@/utils/firestore';
import { ProjectData } from './transform';
import { FieldValue } from 'firebase-admin/firestore';
import { writeGuard } from '../safety/writeGuard';
import { safetyLogger } from '../safety/logger';
import { limitsManager } from '../safety/limits';

/**
 * storeProject
 * Non-destructive Firestore write for a single project.
 *
 * FIRST SYNC  → set() with merge:true — initializes manual field defaults,
 *               never overwrites an existing document wholesale.
 * SUBSEQUENT  → update() with sync-only payload — manual fields are
 *               hard-filtered by writeGuard before the write.
 */
export async function storeProject(project: ProjectData): Promise<void> {
  const docRef = db.collection('projects').doc(project.id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    // ── FIRST SYNC: Initialize document with safe defaults ──────────────────
    // writeGuard.validateNewProject strips FieldValue sentinels before Zod,
    // so we add timestamps AFTER validation.
    const githubPayload = writeGuard.filterSyncPayload(project);

    const initialManualDefaults = {
      displayName: project.name,   // Sensible default — admin can override
      customDesc: '',
      tags: [],
      category: '',
      isFeatured: false,
      isHidden: false,
      showRepoLink: true,
      showWebsiteLink: false,
      techStack: { frontend: [], backend: [], database: [], other: [] },
      features: [],
      systemFlow: '',
      sortOrder: 0,
    };

    // Validate the combined object (without FieldValue sentinels)
    const validated = writeGuard.validateNewProject({
      ...githubPayload,
      ...initialManualDefaults,
      isArchived: false,
      syncStatus: 'IDLE',
    });

    // Use set() with merge:true — safe even if doc was created between the
    // get() and this write (race condition protection).
    await docRef.set(
      {
        ...validated,
        createdAt: FieldValue.serverTimestamp(),
        lastSyncedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await safetyLogger.action(`Initialized new project: ${project.name}`, {
      projectId: project.id,
    });
  } else {
    // ── SUBSEQUENT SYNC: Enrich GitHub fields only ───────────────────────────
    // writeGuard.filterSyncPayload hard-deletes ALL manual fields.
    // Manual data in Firestore is NEVER touched.
    const syncPayload = writeGuard.filterSyncPayload(project);

    await docRef.update({
      ...syncPayload,
      lastSyncedAt: FieldValue.serverTimestamp(),
    });
  }
}

/**
 * storeActivities
 * Idempotent activity storage using doc.create() — prevents duplicates.
 * Enforces per-project activity limits after each batch.
 */
export async function storeActivities(activities: any[]): Promise<number> {
  let createdCount = 0;
  const projectIds = new Set<string>();

  for (const activity of activities) {
    const success = await createActivityIdempotent(activity.id, activity);
    if (success) {
      createdCount++;
      projectIds.add(activity.projectId);
    }
  }

  // Enforce bounded growth: prune activities for every project touched
  for (const projectId of projectIds) {
    await limitsManager.pruneActivities(projectId);
  }

  if (createdCount > 0) {
    await safetyLogger.log(`Synced ${createdCount} new activities.`);
  }

  return createdCount;
}

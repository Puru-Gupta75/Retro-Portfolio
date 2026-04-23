import { db } from '@/utils/firestore';
import { safetyLogger } from './logger';

const MAX_ACTIVITIES_PER_PROJECT = 50;
const MAX_SYSTEM_LOGS = 500;

/**
 * limitsManager
 * Enforces bounded growth rules for Firestore collections.
 */
export const limitsManager = {
  /**
   * Prunes project activities to stay under the limit.
   * Deletes oldest entries.
   */
  async pruneActivities(projectId: string) {
    // Single-field orderBy avoids requiring a composite index.
    // Filter by projectId in memory after fetching.
    const snapshot = await db.collection('activities')
      .orderBy('timestamp', 'desc')
      .get();

    const projectDocs = snapshot.docs.filter(
      doc => doc.data().projectId === projectId
    );

    if (projectDocs.length > MAX_ACTIVITIES_PER_PROJECT) {
      const toDelete = projectDocs.slice(MAX_ACTIVITIES_PER_PROJECT);
      const batch = db.batch();
      toDelete.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      safetyLogger.log(`[LIMITS] Pruned ${toDelete.length} activities for project: ${projectId}`, 'INFO');
    }
  },

  /**
   * Prunes global system logs.
   */
  async pruneLogs() {
    const logsRef = db.collection('systemLogs').orderBy('timestamp', 'desc');
    const snapshot = await logsRef.get();
    
    if (snapshot.size > MAX_SYSTEM_LOGS) {
      const toDelete = snapshot.docs.slice(MAX_SYSTEM_LOGS);
      const batch = db.batch();
      
      toDelete.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      safetyLogger.log(`[LIMITS] Pruned ${toDelete.length} system logs.`, 'INFO');
    }
  }
};

import { db } from '@/utils/firestore';
import { LogSchema, SystemLog } from './validation';
import { limitsManager } from './limits';

/**
 * safetyLogger
 * Ensures all system events are logged, visible, and capped.
 */
export const safetyLogger = {
  async log(message: string, type: SystemLog['type'] = 'INFO', context?: any) {
    const logData: SystemLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      message,
      timestamp: Date.now(),
      context: context ? JSON.stringify(context) : undefined,
      component: 'SAFETY_ENGINE'
    };

    try {
      // 1. Validate against schema
      const validatedLog = LogSchema.parse(logData);
      
      // 2. Write to Firestore — strip undefined fields Firestore can't handle
      const firestoreDoc: Record<string, any> = {};
      for (const [k, v] of Object.entries(validatedLog)) {
        if (v !== undefined) firestoreDoc[k] = v;
      }
      await db.collection('systemLogs').doc(validatedLog.id).set(firestoreDoc);
      
      // 3. Trigger auto-pruning (Fire and forget)
      limitsManager.pruneLogs().catch(console.error);
      
      // 4. Console Mirror for dev visibility
      if (type === 'ERROR') console.error(`[SYSTEM ERROR] ${message}`, context || '');
      else console.log(`[${type}] ${message}`);
      
    } catch (err) {
      // FAIL SAFE: If logging fails, at least dump to console
      console.error('FATAL: SafetyLogger failed to write log to database', err);
    }
  },

  error(message: string, error?: any) {
    return this.log(message, 'ERROR', error);
  },

  warn(message: string, context?: any) {
    return this.log(message, 'WARNING', context);
  },

  action(message: string, context?: any) {
    return this.log(message, 'ACTION', context);
  }
};

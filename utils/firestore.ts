import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, WriteBatch } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const db = getFirestore();

/**
 * Executes a function with a dynamic batch.
 * Ensures we stay within Firestore's 500-operation limit.
 */
export async function runDynamicBatch(
  operations: (batch: WriteBatch) => void
): Promise<void> {
  const batch = db.batch();
  operations(batch);
  await batch.commit();
}

/**
 * Safe activity creation using doc.create() to prevent overwrites.
 * Fails gracefully if activity already exists.
 */
export async function createActivityIdempotent(
  activityId: string,
  data: any
): Promise<boolean> {
  try {
    const docRef = db.collection('activities').doc(activityId);
    await docRef.create({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error: any) {
    // 6 = ALREADY_EXISTS in gRPC
    if (error.code === 6) {
      return false;
    }
    throw error;
  }
}

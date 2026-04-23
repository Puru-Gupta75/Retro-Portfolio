'use client';

import { systemStore, LogType } from '@/store/useSystemStore';

// Call this anywhere in the app to push an event into the live log stream.
// SSR-guarded — safe to import in any component.
export const logEvent = (message: string, type: LogType = 'INFO'): void => {
  if (typeof window === 'undefined') return;
  systemStore.addLog(message, type);
};

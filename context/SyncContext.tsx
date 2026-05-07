'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { systemStore } from '@/store/useSystemStore';

export type SyncStatus = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';

interface SyncLog {
  stage: string;
  message: string;
  timestamp: number;
}

export interface LastHandshake {
  timestamp: string | null;
  duration: number | null;
  itemsProcessed: number | null;
  activitiesCreated: number | null;
  type: string | null;
  status: string | null;
}

interface SyncContextType {
  status: SyncStatus;
  lastSyncTime: string | null;
  lastHandshake: LastHandshake | null;
  logs: SyncLog[];
  error: string | null;
  isAdmin: boolean;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const SYNC_COOLDOWN_MS = 60 * 1000; // 60 seconds

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>('IDLE');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(0);
  const [lastHandshake, setLastHandshake] = useState<LastHandshake | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Subscribe to admin state changes
  useEffect(() => {
    const update = () => setIsAdmin(systemStore.getState().adminAuthenticated);
    update();
    return systemStore.subscribe(update);
  }, []);

  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load last handshake from Firestore on mount — only when admin is authenticated
  useEffect(() => {
    if (!systemStore.getState().adminAuthenticated) return;

    fetch('/api/admin/sync')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.lastHandshake) {
          setLastHandshake(data.lastHandshake);
          if (data.lastHandshake.timestamp) {
            setLastSyncTime(new Date(data.lastHandshake.timestamp).toLocaleTimeString());
          }
        }
      })
      .catch(() => {}); // silently fail — not critical
  }, []);

  const refreshHandshake = useCallback(async () => {
    if (!systemStore.getState().adminAuthenticated) return;
    try {
      const r = await fetch('/api/admin/sync');
      if (!r.ok) return;
      const data = await r.json();
      if (data?.lastHandshake) {
        setLastHandshake(data.lastHandshake);
        if (data.lastHandshake.timestamp) {
          setLastSyncTime(new Date(data.lastHandshake.timestamp).toLocaleTimeString());
        }
      }
    } catch {}
  }, []);

  const addLog = useCallback((stage: string, message: string) => {
    setLogs((prev) => [
      ...prev,
      { stage: stage.toUpperCase(), message: message.toUpperCase(), timestamp: Date.now() },
    ]);
  }, []);

  const triggerSync = useCallback(async () => {
    // Guard: admin only
    if (!systemStore.getState().adminAuthenticated) {
      addLog('ERROR', 'ACCESS_DENIED: ADMIN PRIVILEGES REQUIRED');
      return;
    }

    // Guard: already syncing
    if (status === 'SYNCING') return;

    // Guard: cooldown
    const now = Date.now();
    if (now - lastSyncTimestamp < SYNC_COOLDOWN_MS) {
      const remaining = Math.ceil((SYNC_COOLDOWN_MS - (now - lastSyncTimestamp)) / 1000);
      addLog('WARNING', `SYNC COOLDOWN ACTIVE. WAIT ${remaining}S.`);
      return;
    }

    setStatus('SYNCING');
    setError(null);
    setLogs([]);
    addLog('SYNC', 'INITIATING DATA PIPELINE...');

    try {
      addLog('SYNC', 'REQUESTING GITHUB ARCHIVE DATA...');

      // Uses the admin-authenticated proxy — ADMIN_SYNC_SECRET stays server-side
      const response = await fetch('/api/admin/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      addLog('SYNC', `${data.itemsProcessed} NODES NORMALIZED.`);
      addLog('SYNC', `${data.activitiesCreated} EVENTS LOGGED.`);
      addLog('SUCCESS', `PIPELINE CLEAR. DURATION: ${data.duration}MS.`);

      const syncDate = new Date();
      setLastSyncTime(syncDate.toLocaleTimeString());
      setLastSyncTimestamp(syncDate.getTime());
      setStatus('SUCCESS');

      // Refresh handshake from Firestore
      await refreshHandshake();

      // Reset to idle after a short delay
      setTimeout(() => setStatus('IDLE'), 5000);
    } catch (err: any) {
      setError(err.message);
      setStatus('ERROR');
      addLog('ERROR', `PIPELINE_FAILURE: ${err.message}`);
    }
  }, [status, lastSyncTimestamp, addLog, refreshHandshake]);

  return (
    <SyncContext.Provider value={{ status, lastSyncTime, lastHandshake, logs, error, isAdmin, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
}

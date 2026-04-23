'use client';

import React from 'react';
import { useSync } from '@/context/SyncContext';

export function SyncStatusBar() {
  const { status, lastSyncTime } = useSync();

  const getStatusColor = () => {
    switch (status) {
      case 'SYNCING': return 'text-amber-400 animate-pulse';
      case 'ERROR': return 'text-red-500';
      case 'SUCCESS': return 'text-green-500';
      default: return 'text-amber-900'; // Dim amber for idle
    }
  };

  return (
    <div className="flex items-center gap-6 px-4 py-1 text-[10px] font-mono border-b border-amber-900/30 bg-black/50 backdrop-blur-sm select-none tracking-widest uppercase">
      <div className="flex items-center gap-2">
        <span className="opacity-40">SYS_SYNC:</span>
        <span className={getStatusColor()}>{status}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="opacity-40">LAST:</span>
        <span className="text-amber-700">{lastSyncTime || '--:--:--'}</span>
      </div>

      {status === 'SYNCING' && (
        <div className="flex gap-1 ml-auto">
          <div className="w-1 h-3 bg-amber-500 animate-[bounce_1s_infinite_0ms]" />
          <div className="w-1 h-3 bg-amber-500 animate-[bounce_1s_infinite_200ms]" />
          <div className="w-1 h-3 bg-amber-500 animate-[bounce_1s_infinite_400ms]" />
        </div>
      )}
    </div>
  );
}

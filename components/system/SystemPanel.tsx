'use client';

import React from 'react';
import { useSync } from '@/context/SyncContext';

export function SystemPanel() {
  const { status, lastSyncTime, lastHandshake, logs, error, isAdmin, triggerSync } = useSync();
  const lastLog = logs[logs.length - 1];

  return (
    <div className="relative group w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 border border-amber-900/30 bg-black/40 backdrop-blur-sm font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300 hover:border-amber-500/40 hover:bg-black/60 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        
        {/* Left: Status & Identity */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-3 ${
              status === 'SYNCING' ? 'bg-amber-400 animate-[pulse_0.8s_infinite]' : 
              status === 'ERROR' ? 'bg-red-500' : 'bg-amber-900/40'
            }`} />
            <span className="text-amber-500 font-bold hidden xs:inline">SYNC_ENGINE</span>
            <span className="text-amber-500 font-bold xs:hidden">SYNC</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 border-l border-amber-900/20 pl-4">
            <span className="opacity-30">STATUS:</span>
            <span className={status === 'SYNCING' ? 'text-amber-400' : status === 'ERROR' ? 'text-red-500' : 'text-amber-700'}>
              {status}
            </span>
          </div>
        </div>

        {/* Center: Live Pipeline (Last Log) */}
        <div className="hidden lg:flex flex-1 items-center gap-3 overflow-hidden border-l border-amber-900/20 pl-4 mx-4">
          <span className="opacity-20 shrink-0">OP_STREAM:</span>
          {lastLog ? (
            <div className="flex items-center gap-2 truncate">
              <span className="text-amber-900/60 shrink-0">[{lastLog.stage}]</span>
              <span className="text-amber-600 truncate tracking-tight lowercase">{lastLog.message}</span>
            </div>
          ) : (
            <span className="text-amber-900/20 italic">Awaiting telemetry...</span>
          )}
        </div>

        {/* Right: Metrics & Action */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="hidden md:flex flex-col items-end leading-none gap-1">
            <span className="text-[8px] opacity-30">LAST_HANDSHAKE</span>
            <span className="text-amber-800 tabular-nums">
              {lastHandshake?.timestamp
                ? new Date(lastHandshake.timestamp).toLocaleTimeString()
                : lastSyncTime || '-------'}
            </span>
            {lastHandshake?.duration != null && (
              <span className="text-[8px] text-amber-900/50 tabular-nums">{lastHandshake.duration}ms · {lastHandshake.itemsProcessed ?? 0} nodes</span>
            )}
          </div>

          <button 
            onClick={() => triggerSync()}
            disabled={status === 'SYNCING' || !isAdmin}
            className={`
              relative px-4 py-1.5 overflow-hidden transition-all duration-200 border
              ${!isAdmin
                ? 'opacity-20 cursor-not-allowed border-amber-900/20 text-amber-900/40'
                : status === 'SYNCING' 
                ? 'opacity-40 cursor-not-allowed border-amber-900/20 text-amber-900/40' 
                : 'border-amber-500/30 text-amber-500 hover:border-amber-400 hover:text-amber-400 hover:bg-amber-500/5 hover:shadow-[0_0_15px_rgba(251,191,36,0.1)] active:scale-95'
              }
            `}
          >
            <span className="relative z-10">{status === 'SYNCING' ? 'EXECUTING...' : '[ FORCE_SYNC ]'}</span>
            {status === 'SYNCING' && (
              <div className="absolute inset-0 bg-amber-500/10 animate-[pulse_1s_infinite]" />
            )}
          </button>
        </div>
      </div>

      {/* Error Overlay (Small and sleek) */}
      {error && (
        <div className="mt-1 px-4 py-1 bg-red-950/40 border border-red-500/20 text-red-500 text-[8px] tracking-[0.3em] uppercase flex items-center gap-2 animate-in slide-in-from-top-1 duration-300">
          <span className="animate-pulse">⚠</span>
          <span>CRITICAL_FAULT: {error}</span>
        </div>
      )}
    </div>
  );
}

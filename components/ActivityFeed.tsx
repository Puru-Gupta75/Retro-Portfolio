'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';
import { sounds } from '@/lib/soundEngine';

// Fallback logs shown while Firestore data loads
const FALLBACK_LOGS = [
  '[OK] CORE_SYNC_STARTED',
  '[LOAD] NET_SHADERS... OK',
  '[INIT] HUD_OVERLAY',
  '[BUSY] SCANNING_PERIPHERALS',
  '[OK] CRT_EMULATION_STABLE',
  '[OK] GLITCH_KERNEL_ACTIVE',
  '[LOAD] IDENTITY_MODULE... OK',
  '[INIT] UPLINK_TUNNEL',
  '[OK] DATA_VINE_CONNECTED',
  '[BUSY] CALCULATING_PHOSPHOR_DECAY',
  '[OK] AMBER_SPECTRUM_SYNCED',
  '[LOAD] POST_PROCESS_BUFFERS... OK',
  '[INIT] INTERFACE_HANDSHAKE',
  '[OK] SYSTEM_INTEGRITY_VERIFIED',
  '[BUSY] MONITORING_THERMALS',
  '[OK] FAN_SPEED_OPTIMIZED',
  '[LOAD] ANALYTICS_ENGINE... OK',
  '[INIT] COMMAND_PALETTE',
  '[OK] SESSION_LOGGING_ACTIVE',
  '[OK] ROOT_ACCESS_GRANTED',
];

type LogEntry = { text: string; timestamp: string };

export const ActivityFeed: React.FC = () => {
  const { config } = useSiteConfig();
  const activityLogs: string[] =
    (config?.uplink as any)?.activityLogs ?? FALLBACK_LOGS;

  const [visibleLogs, setVisibleLogs] = useState<LogEntry[]>([]);
  const logIndexRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const makeEntry = (text: string): LogEntry => ({
    text,
    timestamp: new Date().toLocaleTimeString('en-GB', {
      hour12: false,
      minute: '2-digit',
      second: '2-digit',
    }),
  });

  useEffect(() => {
    if (activityLogs.length === 0) return;

    setVisibleLogs(activityLogs.slice(0, 5).map(makeEntry));
    logIndexRef.current = 5;

    let timeoutId: NodeJS.Timeout;

    const addLog = () => {
      const randomDelay = 1000 + Math.random() * 3000;
      timeoutId = setTimeout(() => {
        const nextLog = activityLogs[logIndexRef.current % activityLogs.length];
        logIndexRef.current += 1;
        const entry = makeEntry(nextLog);
        sounds.playClick();
        setVisibleLogs((prev) => [...prev, entry].slice(-12));
        addLog();
      }, randomDelay);
    };

    addLog();
    return () => clearTimeout(timeoutId);
  }, [activityLogs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center border-b border-primary/10 pb-2">
        <h2 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
          &gt; SYSTEM_ACTIVITY_FEED
        </h2>
        <span className="text-[8px] font-mono text-primary animate-pulse">● LIVE</span>
      </header>

      <div
        ref={scrollRef}
        className="h-48 overflow-y-auto scrollbar-hide font-mono text-[11px] space-y-1 opacity-80"
      >
        {visibleLogs.map((entry, i) => (
          <div
            key={`${logIndexRef.current}-${i}`}
            className="flex gap-4 animate-in fade-in slide-in-from-left-2 anim-duration-300"
          >
            <span className="opacity-20 shrink-0">{entry.timestamp}</span>
            <span className={entry.text.includes('[OK]') ? 'text-primary' : 'text-primary/60'}>
              {entry.text}
            </span>
          </div>
        ))}
        <div className="cursor-block h-3 w-1.5 bg-primary/40 animate-pulse inline-block" />
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';
import { sounds } from '@/lib/soundEngine';
import type { SkillsData } from '@/lib/useSiteConfig';

// Shown only while data is still loading
const BOOT_LOGS = [
  '[INIT] SYSTEM_BOOT',
  '[LOAD] FETCHING_MODULES... OK',
  '[BUSY] LOADING_DATA',
];

type LogEntry = { text: string; timestamp: string };

/** Build meaningful log lines from real projects + skills data */
function buildLogsFromConfig(
  projects: Array<{ name?: string; displayName?: string; description?: string; customDesc?: string }>,
  skills: SkillsData | null,
): string[] {
  const logs: string[] = [];

  // ── Projects ──────────────────────────────────────────────────────────────
  for (const p of projects) {
    const name = (p.displayName || p.name || '').toUpperCase().replace(/\s+/g, '_');
    const desc = (p.customDesc || p.description || '').trim();
    if (!name) continue;
    logs.push(`[PROJECT] ${name}`);
    if (desc) logs.push(`[INFO] ${desc.length > 60 ? desc.slice(0, 57) + '...' : desc}`);
  }

  // ── Skills (in category order) ────────────────────────────────────────────
  if (skills) {
    const categoryOrder = ['frontend', 'backend', 'data', 'tools'];
    const allCategories = [
      ...categoryOrder,
      ...Object.keys(skills).filter((k) => !categoryOrder.includes(k)),
    ];

    for (const cat of allCategories) {
      const raw = skills[cat];
      // Guard: Firestore may store non-array values on the same document
      const items: string[] = Array.isArray(raw) ? raw : [];
      if (items.length === 0) continue;
      logs.push(`[SKILL:${cat.toUpperCase()}] ${items.join(' · ')}`);
    }
  }

  return logs;
}

export const ActivityFeed: React.FC = () => {
  const { config } = useSiteConfig();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const visible = data
          .filter((p) => p.isVisible !== false && !p.isHidden)
          .sort(
            (a, b) =>
              (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
              (a.displayName || a.name || '').localeCompare(b.displayName || b.name || ''),
          );
        setProjects(visible);
      })
      .catch(() => {/* silently ignore — boot logs will show */});
  }, []);

  const activityLogs: string[] = useMemo(() => {
    // Admin-configured override takes priority
    const override = (config?.uplink as any)?.activityLogs as string[] | undefined;
    if (Array.isArray(override) && override.length > 0) return override;

    // Build from real data once at least one source is available
    if (projects.length > 0 || config?.skills) {
      return buildLogsFromConfig(projects, config?.skills ?? null);
    }

    return BOOT_LOGS;
  }, [projects, config]);

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
            <span
              className={
                entry.text.startsWith('[PROJECT]')
                  ? 'text-primary font-semibold'
                  : entry.text.startsWith('[SKILL:')
                  ? 'text-primary/80'
                  : entry.text.startsWith('[INFO]')
                  ? 'text-primary/50 italic'
                  : entry.text.includes('[OK]')
                  ? 'text-primary'
                  : 'text-primary/60'
              }
            >
              {entry.text}
            </span>
          </div>
        ))}
        <div className="cursor-block h-3 w-1.5 bg-primary/40 animate-pulse inline-block" />
      </div>
    </div>
  );
};

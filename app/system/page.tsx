'use client';

import React, { useEffect } from 'react';
import { useSystem } from '@/context/SystemContext';
import { logEvent } from '@/lib/systemLogger';

import { SystemMetrics }   from '@/components/SystemMetrics';
import { ModuleStatus }    from '@/components/ModuleStatus';
import { SystemLogs }      from '@/components/SystemLogs';
import { CommandTerminal } from '@/components/CommandTerminal';
import { DisplayControl }  from '@/components/DisplayControl';
import { CRTControl }      from '@/components/CRTControl';
import { AudioControl }    from '@/components/AudioControl';
import { SystemActions }   from '@/components/SystemActions';
import { SystemPanel }     from '@/components/system/SystemPanel';

export default function SystemPage() {
  const { device } = useSystem();
  const isMobile = device === 'mobile';

  useEffect(() => {
    logEvent('SYSTEM ENGINE ONLINE', 'INFO');
    logEvent('PERFORMANCE MONITOR ACTIVE', 'INFO');
    if (!isMobile) logEvent('COMMAND TERMINAL READY', 'INFO');
  }, [isMobile]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 anim-duration-1000">

      {/* ── HEADER ── */}
      <header className="space-y-3">
        <h1 className={`font-space font-bold tracking-[-0.04em] uppercase text-glow ${isMobile ? 'text-3xl' : 'text-4xl md:text-6xl'}`}>
          &gt; SYSTEM
        </h1>
        {!isMobile && (
          <p className="font-mono text-sm leading-relaxed opacity-80 max-w-2xl">
            RUNTIME DIAGNOSTICS :: LIVE PERFORMANCE METRICS, EVENT LOGS, AND SYSTEM CONTROLS.
          </p>
        )}
      </header>

      <section className="space-y-4">
        {!isMobile && (
          <h2 className="text-[10px] font-mono tracking-[0.4em] opacity-30 uppercase">
            ── SYNC_ENGINE ──────────────────────────────────────────────────────
          </h2>
        )}
        <SystemPanel />
      </section>

      {/* ── ENGINE CORE ── */}
      <section className="space-y-4">
        {!isMobile && (
          <h2 className="text-[10px] font-mono tracking-[0.4em] opacity-30 uppercase">
            ── ENGINE_CORE ──────────────────────────────────────────────────────
          </h2>
        )}
        <div className={`grid gap-6 items-start ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          <SystemMetrics />
          {!isMobile && <ModuleStatus />}
        </div>
      </section>

      {/* ── RUNTIME INTERFACE — desktop/tablet only ── */}
      {!isMobile && (
        <section className="space-y-4">
          <h2 className="text-[10px] font-mono tracking-[0.4em] opacity-30 uppercase">
            ── RUNTIME_INTERFACE ────────────────────────────────────────────────
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <SystemLogs />
            <CommandTerminal />
          </div>
        </section>
      )}

      {/* ── HARDWARE CONTROLS ── */}
      <section className={`space-y-4 border-t border-primary/10 pt-6`}>
        {!isMobile && (
          <h2 className="text-[10px] font-mono tracking-[0.4em] opacity-30 uppercase">
            ── HARDWARE_CONTROLS ────────────────────────────────────────────────
          </h2>
        )}
        <div className={`grid gap-6 items-start ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
          <AudioControl />
          {/* CRT and Display controls are irrelevant on mobile */}
          {!isMobile && <DisplayControl />}
          {!isMobile && <CRTControl />}
        </div>
      </section>

      {/* ── SYSTEM OPERATIONS ── */}
      <section className="border-t border-primary/10 pt-6">
        <SystemActions />
      </section>

      <footer className="pt-6 opacity-10 font-mono text-[9px] text-center uppercase tracking-[0.4em]">
        _ _ _ SYSTEM_DIAGNOSTICS_COMPLETE // ALL_MODULES_NOMINAL _ _ _
      </footer>

    </div>
  );
}

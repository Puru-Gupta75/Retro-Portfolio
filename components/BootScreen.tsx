'use client';

import React, { useEffect, useRef } from 'react';
import { useBootSequence } from '@/hooks/useBootSequence';

interface BootScreenProps {
  onComplete: () => void;
}

function getLineColor(log: string): string {
  if (log.startsWith('[OK]'))            return 'text-primary phosphor-glow';
  if (log.startsWith('[SECURE]'))        return 'text-primary/90';
  if (log.startsWith('[INIT]'))          return 'text-primary/70';
  if (log.startsWith('[LOAD]'))          return 'text-primary/55';
  if (log.startsWith('[ERR]'))           return 'text-red-400';
  if (log.startsWith('ACCESS_GRANTED')) return 'text-primary text-glow font-bold tracking-widest';
  if (log.startsWith('LAUNCHING'))       return 'text-primary phosphor-glow font-bold';
  if (log.includes('[██'))               return 'text-primary/80';
  return 'text-primary/45';
}

export const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const { displayedLogs, isSkipping, bootComplete } = useBootSequence(onComplete);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedLogs]);

  return (
    /* CRT frame — matches site's crt-frame + crt-screen structure */
    <div className="crt-frame fixed inset-0 z-999">
      <div className="crt-screen">

        {/* Main content layer */}
        <div
          className={`
            relative z-5 w-full h-full flex flex-col font-mono p-8 md:p-12 overflow-hidden bg-background
            ${bootComplete ? 'animate-glitch-exit' : ''}
          `}
        >
          {/* ── HEADER ── */}
          <div className="mb-8 space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block w-2 h-2 bg-primary animate-blink" />
              <p className="text-xs text-primary tracking-[0.4em] uppercase phosphor-glow">
                AMBER_OS // BOOT_SEQUENCE_v6.2.1
              </p>
            </div>
            <p className="text-[10px] text-primary/40 tracking-widest uppercase">
              COPYRIGHT (C) 1982-198X AMBER CORP. — ALL RIGHTS RESERVED
            </p>
            <p className="text-[10px] text-primary/30 tracking-widest uppercase">
              HARDWARE: AMBER-CORE v4.2 · BIOS: REV 6F · RECOVERY_MODE: ENABLED
            </p>
            <div className="mt-4 h-px w-full bg-primary/15" />
          </div>

          {/* ── LOG STREAM ── */}
          <div
            className="flex-1 overflow-y-auto scrollbar-hide space-y-[4px]"
            role="status"
            aria-live="polite"
            aria-label="Boot log"
            aria-atomic="false"
          >
            {displayedLogs.map((log, i) => (
              <div key={i} className="flex gap-4 items-baseline leading-relaxed">
                <span className="shrink-0 text-[9px] text-primary/20 tabular-nums w-8">
                  {i.toString().padStart(3, '0')}
                </span>
                <span className={`text-[13px] md:text-sm tracking-wide ${getLineColor(log)}`}>
                  {log}
                </span>
              </div>
            ))}

            {/* Blinking cursor */}
            {!bootComplete && (
              <div className="flex gap-4 items-center mt-1">
                <span className="shrink-0 text-[9px] text-primary/20 tabular-nums w-8">
                  {displayedLogs.length.toString().padStart(3, '0')}
                </span>
                <span className="inline-block h-[14px] w-[8px] bg-primary animate-blink" />
              </div>
            )}

            <div ref={logEndRef} />
          </div>

          {/* ── FOOTER ── */}
          <div className="mt-6 pt-4 border-t border-primary/10 flex justify-between items-center text-[10px] text-primary/40 uppercase tracking-widest">
            <span>
              {isSkipping ? ':: FAST_BOOT_INTERRUPT' : ':: SYSTEM_HANDSHAKE_IN_PROGRESS'}
            </span>
            {!isSkipping && !bootComplete && (
              <span className="animate-pulse">PRESS ANY KEY TO SKIP</span>
            )}
          </div>
        </div>

        {/* ── CRT LAYERS — same stack as CRTWrapper ── */}
        <div className="crt-phosphor-glow" />
        <div className="crt-curvature" />
        <div className="crt-scanlines" style={{ opacity: 'var(--scanline-opacity)' }} />
        <div className="crt-flicker" />
        <div className="crt-vignette" />
        <div className="crt-reflection" />
      </div>
    </div>
  );
};

export default BootScreen;

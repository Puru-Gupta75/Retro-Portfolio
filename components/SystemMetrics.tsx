'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSystem } from '@/context/SystemContext';
import { systemStore } from '@/store/useSystemStore';
import { logEvent } from '@/lib/systemLogger';

type CtxMode = 'auto' | 'high' | 'low';
const MODE_LABEL: Record<CtxMode, string> = { auto: 'AUTO', high: 'HIGH', low: 'LOW' };

export const SystemMetrics: React.FC = () => {
  const { performanceMode, setPerformanceMode, actualPerformance } = useSystem();
  const [fps, setFps] = useState(0);
  const [memory] = useState<number | string>(
    () => typeof navigator !== 'undefined' ? (navigator as any).deviceMemory ?? 'N/A' : 'N/A'
  );

  // Sync FPS from store
  useEffect(() => {
    const sync = () => setFps(systemStore.getState().fps);
    return systemStore.subscribe(sync);
  }, []);

  // Real rAF FPS counter
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf: number;
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now >= last + 1000) {
        const currentFps = frames;
        systemStore.setFPS(currentFps);

        // Trigger safe mode if FPS is critically low
        if (currentFps < 20 && !systemStore.getState().safeMode) {
          systemStore.setSafeMode(true);
          logEvent('LOW FPS DETECTED → SAFE MODE ENABLED', 'ERROR');
        }

        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Read uptime from store
  const [uptime, setUptime] = useState(() => systemStore.getState().uptime);
  useEffect(() => {
    return systemStore.subscribe(() => setUptime(systemStore.getState().uptime));
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const handleMode = useCallback((m: CtxMode) => {
    setPerformanceMode(m);
    logEvent(`PERFORMANCE MODE → ${m.toUpperCase()}`, 'ACTION');
  }, [setPerformanceMode]);

  const fpsColor = fps >= 55 ? 'text-primary phosphor-glow' : fps >= 30 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; PERFORMANCE_METRICS
      </h3>

      {/* Live readouts */}
      <div className="bg-primary/5 border border-primary/10 p-4 space-y-2">
        {[
          { label: 'FPS',      value: fps.toString(),                        cls: fpsColor },
          { label: 'MEMORY',   value: memory !== 'N/A' ? `${memory} GB` : 'N/A', cls: 'text-primary' },
          { label: 'UPTIME',   value: formatUptime(uptime),                  cls: 'text-primary' },
          { label: 'MODE',     value: MODE_LABEL[performanceMode],           cls: 'text-primary' },
          { label: 'RESOLVED', value: actualPerformance.toUpperCase(),       cls: 'text-primary/50' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="flex justify-between items-center font-mono text-[11px]">
            <span className="opacity-40 uppercase">{label}</span>
            <span className={`font-bold tabular-nums ${cls}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2">
        {(['auto', 'high', 'low'] as CtxMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleMode(m)}
            className={`py-2 font-mono text-[10px] border uppercase transition-all
              ${performanceMode === m
                ? 'bg-primary text-black phosphor-glow border-primary'
                : 'border-primary/20 text-primary/40 hover:text-primary hover:bg-primary/5'}`}
          >
            [{MODE_LABEL[m]}]
          </button>
        ))}
      </div>
    </div>
  );
};

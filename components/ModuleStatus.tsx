'use client';

import React from 'react';
import { useSystem } from '@/context/SystemContext';

type ModuleState = 'ACTIVE' | 'READY' | 'STANDBY';

type Module = { id: string; name: string; state: ModuleState };

const DOT: Record<ModuleState, string>  = { ACTIVE: '●', READY: '○', STANDBY: '◌' };
const CLR: Record<ModuleState, string>  = {
  ACTIVE:  'text-primary phosphor-glow',
  READY:   'text-primary/60',
  STANDBY: 'text-primary/25',
};

export const ModuleStatus: React.FC = () => {
  const { crtEnabled, audioEnabled, actualPerformance } = useSystem();

  const modules: Module[] = [
    { id: 'MOD-01', name: 'ASCII_ENGINE',  state: actualPerformance === 'high' ? 'ACTIVE' : 'STANDBY' },
    { id: 'MOD-02', name: 'CRT_LAYER',     state: crtEnabled   ? 'ACTIVE'  : 'STANDBY' },
    { id: 'MOD-03', name: 'AUDIO_SYSTEM',  state: audioEnabled ? 'ACTIVE'  : 'READY'   },
    { id: 'MOD-04', name: 'NAV_SYSTEM',    state: 'ACTIVE' },
    { id: 'MOD-05', name: 'SYSTEM_LOGGER', state: 'ACTIVE' },
    { id: 'MOD-06', name: 'PERF_MONITOR',  state: 'ACTIVE' },
  ];

  const activeCount = modules.filter((m) => m.state === 'ACTIVE').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
          &gt; MODULE_STATUS
        </h3>
        <span className="text-[9px] font-mono opacity-20 uppercase tracking-widest">
          {activeCount}/{modules.length} ACTIVE
        </span>
      </div>

      <div className="bg-primary/5 border border-primary/10 p-4 space-y-2">
        {modules.map((mod) => (
          <div key={mod.id} className="flex items-center justify-between font-mono text-[10px]">
            <div className="flex items-center gap-3">
              <span className="opacity-20 tabular-nums">{mod.id}</span>
              <span className="opacity-60 uppercase">{mod.name}</span>
            </div>
            <div className={`flex items-center gap-1.5 ${CLR[mod.state]}`}>
              <span>{DOT[mod.state]}</span>
              <span className="uppercase tracking-widest">{mod.state}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[9px] font-mono opacity-20 uppercase tracking-widest">
        * STATES REFLECT LIVE SYSTEM CONTEXT
      </p>
    </div>
  );
};

'use client';

import React from 'react';

// Theme is locked to AMBER — no switching per Phosphor Ghost design rules.
// This panel shows the active display configuration as read-only.
export const DisplayControl: React.FC = () => {
  const specs = [
    { label: 'PHOSPHOR_TYPE',  value: 'P1_AMBER' },
    { label: 'COLOR_TEMP',     value: '2700K' },
    { label: 'PERSISTENCE',    value: '12ms' },
    { label: 'DECAY_CURVE',    value: 'EXPONENTIAL' },
    { label: 'SPECTRUM',       value: '#FFB000' },
    { label: 'CONTRAST_RATIO', value: '21:1' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; DISPLAY_SPECTRUM
      </h3>

      <div className="bg-primary/5 border border-primary/10 p-4 space-y-1">
        <p className="text-[9px] font-mono text-primary/60 uppercase tracking-widest mb-3">
          ACTIVE_PROFILE: PHOSPHOR_GHOST_AMBER
        </p>
        {specs.map((s) => (
          <div key={s.label} className="flex justify-between items-center font-mono text-[10px]">
            <span className="opacity-40 uppercase">{s.label}</span>
            <span className="text-primary font-bold">{s.value}</span>
          </div>
        ))}
      </div>

      <p className="text-[9px] font-mono opacity-20 uppercase tracking-widest leading-tight">
        * Display locked to AMBER_PHOSPHOR. Single-theme system by design.
      </p>
    </div>
  );
};

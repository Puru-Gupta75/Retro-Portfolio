'use client';

import React from 'react';
import { useSystem } from '@/context/SystemContext';

export const CRTControl: React.FC = () => {
const { crtEnabled, toggleCRT } = useSystem();

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; HARDWARE_DISTORTION
      </h3>
      
      <button
        onClick={toggleCRT}
        className={`
          w-full py-4 font-mono text-xs transition-all border
          ${crtEnabled 
            ? 'bg-primary text-black phosphor-glow border-primary' 
            : 'border-primary/20 text-primary/40 hover:text-primary hover:bg-primary/5'}
        `}
      >
        {crtEnabled ? '[ CRT_LENS: ACTIVE ]' : '[ CRT_LENS: BYPASSED ]'}
      </button>
      <p className="text-[9px] font-mono opacity-20 uppercase tracking-widest text-center">
        Controls WebGL-based barrel distortion and aberration.
      </p>
    </div>
  );
};

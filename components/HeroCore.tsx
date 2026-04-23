'use client';

import React from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const HeroCore: React.FC = () => {
  const { config } = useSiteConfig();
  const identity = config?.identity;

  return (
    <div className="relative py-16 flex flex-col items-center justify-center overflow-hidden border-y border-primary/5">
      {/* Visual Decor: Scaled ASCII background effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center text-[10vw] font-bold leading-none tracking-tighter">
        10101010101010101
      </div>

      <div className="relative z-10 text-center space-y-2">
        <p className="text-[10px] tracking-[0.5em] opacity-40 animate-pulse">
          :: {identity?.systemStatus ?? 'SYSTEM_ONLINE'}
        </p>
        
        <h1 className="text-5xl md:text-8xl font-space font-bold tracking-[-0.06em] text-glow animate-flicker">
          {identity?.systemName ?? '...'}
        </h1>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className="h-px w-8 bg-primary/20" />
          <p className="text-[10px] font-mono tracking-widest opacity-60">
            {identity?.systemTagline ?? ''}
          </p>
          <span className="h-px w-8 bg-primary/20" />
        </div>
      </div>

      {/* Modern Brutalist Anchor points */}
      <div className="absolute top-4 left-4 w-1 h-1 bg-primary/40" />
      <div className="absolute top-4 right-4 w-1 h-1 bg-primary/40" />
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-primary/40" />
      <div className="absolute bottom-4 right-4 w-1 h-1 bg-primary/40" />
    </div>
  );
};

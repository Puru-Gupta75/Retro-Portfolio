'use client';

import React from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const IdentityPanel: React.FC = () => {
  const { config } = useSiteConfig();
  const identity = config?.identity;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-b border-primary/10 pb-12 mb-12">
      {/* ASCII PORTRAIT BLOCK */}
      <div className="relative group aspect-square bg-surface/20 border border-primary/10 flex items-center justify-center overflow-hidden">
        {/* Subtle background pulse */}
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        
        <div className="relative z-10 font-mono text-[10px] leading-[0.8] tracking-tighter opacity-80 group-hover:animate-flicker transition-all">
          <pre>
{`
   _______
  /       \\
 |  O   O  |
 |    ^    |
  \\  ---  /
   \\_____/
    |   |
  --|   |--
`}
          </pre>
        </div>

        {/* HUD Deco */}
        <div className="absolute top-2 left-2 text-[8px] opacity-30 font-mono">SCAN_ACTIVE</div>
        <div className="absolute bottom-2 right-2 text-[8px] opacity-30 font-mono">
          0x{identity?.profileSystemId ?? '...'}
        </div>
      </div>

      {/* IDENTITY DATA */}
      <div className="md:col-span-2 space-y-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-space font-bold text-glow tracking-tighter uppercase">
            {identity?.profileRole ?? '...'}
          </h2>
          <p className="font-mono text-xs opacity-40 uppercase tracking-[0.4em]">
            SYSTEM_ID: {identity?.profileSystemId ?? '...'} // {identity?.profileStatus ?? '...'}
          </p>
        </div>

        <div className="bg-primary/5 p-6 border-l-2 border-primary/40 italic font-mono text-sm opacity-80 leading-relaxed">
          &quot;{identity?.profileTagline ?? '...'}&quot;
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <div className="flex flex-col">
            <span className="text-[8px] opacity-30 uppercase font-bold">Latency</span>
            <span className="text-primary font-mono text-xs">0.02ms</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] opacity-30 uppercase font-bold">Uptime</span>
            <span className="text-primary font-mono text-xs">99.99%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] opacity-30 uppercase font-bold">Location</span>
            <span className="text-primary font-mono text-xs">DELHI_IN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

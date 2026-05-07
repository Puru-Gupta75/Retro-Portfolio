'use client';

import React from 'react';
import Image from 'next/image';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const IdentityPanel: React.FC = () => {
  const { config } = useSiteConfig();
  const identity = config?.identity;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start border-b border-primary/10 pb-12 mb-12">
      {/* PORTRAIT BLOCK */}
      <div className="relative group aspect-square bg-surface/20 border border-primary/10 flex items-center justify-center overflow-hidden">
        {/* Actual photo */}
        <Image
          src="/profile/puru.jpg"
          alt="Puru Gupta"
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority
        />

        {/* Amber/primary tint to match site palette */}
        <div className="absolute inset-0 bg-primary/10 mix-blend-color z-10 pointer-events-none" />

        {/* Scanlines */}
        <div
          className="absolute inset-0 z-20 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 4px)',
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Hover border glow */}
        <div className="absolute inset-0 z-30 border border-primary/0 group-hover:border-primary/60 transition-all duration-300 pointer-events-none" />

        {/* HUD Deco */}
        <div className="absolute top-2 left-2 text-[8px] opacity-40 font-mono z-30 text-primary">SCAN_ACTIVE</div>
        <div className="absolute bottom-2 right-2 text-[8px] opacity-40 font-mono z-30 text-primary">
          0x{identity?.profileSystemId ?? '...'}
        </div>

        {/* Corner brackets */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-primary/50 z-30" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-primary/50 z-30" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-primary/50 z-30" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-primary/50 z-30" />
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

'use client';

import { HeroCore } from '@/components/HeroCore';
import { ActivityFeed } from '@/components/ActivityFeed';
import { QuickNav } from '@/components/QuickNav';
import { SystemSummary } from '@/components/SystemSummary';
import { useSiteConfig } from '@/lib/useSiteConfig';
import Image from 'next/image';
import { useState } from 'react';

function QuickLinks() {
  const { config } = useSiteConfig();
  const commands = config?.uplink?.commands ?? [];
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleClick = (cmd: typeof commands[number]) => {
    if (cmd.action === 'COPY' && cmd.value) {
      navigator.clipboard.writeText(cmd.value);
      setCopiedCmd(cmd.cmd);
      setTimeout(() => setCopiedCmd(null), 2000);
    } else if (cmd.url) {
      window.open(cmd.url, '_blank');
    }
  };

  return (
    <div className="flex gap-2">
      {commands.map((cmd) => (
        <button
          key={cmd.cmd}
          onClick={() => handleClick(cmd)}
          className="group flex-1 flex items-center justify-center bg-surface/30 py-3 px-2 border border-primary/5 hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <span className="font-mono text-primary text-xs font-bold tracking-widest">
            {copiedCmd === cmd.cmd ? 'COPIED!' : cmd.cmd}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 anim-duration-1000">
      {/* 1. HERO CORE - Identity & Presence */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2">
          <HeroCore />
        </div>

        <div className="space-y-6">
          {/* Profile photo with CRT aesthetic */}
          <div className="h-[300px] border border-primary/10 bg-surface/5 relative group overflow-hidden">
            {/* Photo */}
            <Image
              src="/profile/puru.jpg"
              alt="Puru Gupta"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1280px) 100vw, 33vw"
              priority
            />

            {/* Amber/primary tint to match site palette */}
            <div className="absolute inset-0 bg-primary/10 mix-blend-color z-10 pointer-events-none" />

            {/* Scanlines */}
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-25"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
              }}
            />

            {/* Vignette */}
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
              }}
            />

            {/* HUD labels */}
            <div className="absolute top-2 left-2 text-[8px] font-mono text-primary/50 z-30">SCAN_ACTIVE</div>
            <div className="absolute bottom-2 right-2 text-[8px] font-mono text-primary/50 z-30">ID::PURU_GUPTA</div>

            {/* Corner brackets */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-primary/50 z-30" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-primary/50 z-30" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-primary/50 z-30" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-primary/50 z-30" />

            {/* Hover border glow */}
            <div className="absolute inset-0 z-30 border border-primary/0 group-hover:border-primary/60 transition-all duration-300 pointer-events-none" />
          </div>

          {/* Quick Access Buttons */}
          <QuickLinks />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 2. ACTIVITY FEED - Live System Logs */}
        <section className="order-2 lg:order-1">
          <ActivityFeed />
        </section>

        {/* 3. QUICK NAVIGATION - Direct Access */}
        <section className="order-1 lg:order-2">
          <QuickNav />
        </section>
      </div>

      {/* 4. SYSTEM SUMMARY - Hardware Snapshot */}
      <section className="pt-8 border-t border-primary/10">
        <SystemSummary />
      </section>

      {/* FOOTER METADATA */}
      <div className="pt-8 opacity-20 font-mono text-[9px] text-center uppercase tracking-[0.4em]">
        _ _ _ TERMINAL_SESSION_ACTIVE // ROOT_ENVIRONMENT_READY _ _ _
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const Achievements: React.FC = () => {
  const { config, loading } = useSiteConfig();
  const items = config?.achievements?.items ?? [];

  if (loading) {
    return (
      <div className="text-primary/30 font-mono text-[10px] animate-pulse uppercase tracking-[0.5em]">
        LOADING ACHIEVEMENTS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-mono tracking-[0.3em] opacity-40 uppercase border-b border-primary/10 pb-2 whitespace-nowrap">
        &gt; ACHIEVEMENTS_&_LEADERSHIP
      </h3>

      <ul className="space-y-3 font-mono text-sm">
        {items.map((achievement, index) => (
          <li key={index} className="group flex items-center gap-4 transition-all hover:bg-primary/5 p-2 px-4 cursor-default border-l border-transparent hover:border-primary">
            <span className="text-primary font-bold opacity-30 group-hover:opacity-100">[{index + 1}]</span>
            <span className="opacity-70 group-hover:text-glow group-hover:opacity-100 transition-all uppercase tracking-tight">
              {achievement}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

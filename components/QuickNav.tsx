'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const QuickNav: React.FC = () => {
  const { config } = useSiteConfig();
  // Exclude Home from quick nav
  const subModules = (config?.navigation?.items ?? []).slice(1);

  return (
    <div className="space-y-4">
      <h2 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; MODULE_DIRECT_ACCESS
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {subModules.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className="group flex justify-between items-center bg-surface/30 p-4 border border-primary/5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
          >
            <span className="font-mono text-primary group-hover:text-glow transition-colors text-xs font-bold tracking-widest">
              {item.label}
            </span>
            <span className="font-mono text-[9px] opacity-20 group-hover:opacity-60 transition-opacity">
              [ ACCESS_0x{item.id} ]
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

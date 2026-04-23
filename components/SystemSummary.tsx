'use client';

import React from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const SystemSummary: React.FC = () => {
  const { config } = useSiteConfig();
  const stats = config?.systemStats?.stats ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase border-b border-primary/10 pb-2">
        &gt; HARDWARE_SUMMARY
      </h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <p className="text-[8px] font-mono opacity-40 uppercase">{stat.label}</p>
            <p className="text-xs font-mono font-bold text-primary tracking-tighter">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-4 flex flex-col gap-1">
          <div className="h-1 bg-surface relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/20 animate-pulse w-3/4" />
          </div>
          <p className="text-[8px] font-mono opacity-20 text-right uppercase">LOAD_FACTOR: 75%</p>
      </div>
    </div>
  );
};

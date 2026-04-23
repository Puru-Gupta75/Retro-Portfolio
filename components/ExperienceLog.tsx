'use client';

import React from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const ExperienceLog: React.FC = () => {
  const { config, loading } = useSiteConfig();
  const entries = config?.experience?.entries ?? [];

  if (loading) {
    return (
      <div className="text-primary/30 font-mono text-[10px] animate-pulse uppercase tracking-[0.5em]">
        LOADING EXPERIENCE LOG...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-sm font-mono tracking-[0.3em] opacity-40 uppercase border-b border-primary/10 pb-4">
        &gt; EXPERIENCE_TIMELINE_LOGS
      </h3>

      <div className="relative pl-4 border-l border-primary/10 space-y-12">
        {entries.map((entry, index) => (
          <div key={index} className="relative">
            {/* Timeline dot — square, no rounded corners */}
            <div className="absolute left-[-21px] top-1.5 w-2 h-2 bg-primary/20 border border-primary/40" />
            
            <div className="space-y-2 group">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <span className="text-[10px] font-mono text-primary font-bold opacity-60">[{entry.year}]</span>
                <h4 className="text-lg font-space font-bold tracking-tight uppercase group-hover:text-glow transition-all">
                  {entry.role}
                </h4>
              </div>
              <p className="font-mono text-xs opacity-70 leading-relaxed max-w-2xl border-l border-primary/5 pl-4 ml-1">
                {entry.description}
              </p>
            </div>
          </div>
        ))}
        
        {/* Continuous terminal feeling anchor */}
        <div className="absolute bottom-0 left-[-5px] text-[8px] font-mono opacity-20 animate-pulse">
          LOAD_MORE...
        </div>
      </div>
    </div>
  );
};

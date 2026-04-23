'use client';

import React from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const EducationBlock: React.FC = () => {
  const { config, loading } = useSiteConfig();
  const entries = config?.education?.entries ?? [];

  if (loading) {
    return (
      <div className="text-primary/30 font-mono text-[10px] animate-pulse uppercase tracking-[0.5em]">
        LOADING EDUCATION DATA...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-mono tracking-[0.3em] opacity-40 uppercase border-b border-primary/10 pb-4">
        &gt; EDUCATIONAL_FOUNDATION
      </h3>

      <div className="grid grid-cols-1 gap-6">
        {entries.map((edu, index) => (
          <div key={index} className="bg-primary/5 p-6 border border-primary/5 space-y-2 group hover:bg-primary/10 transition-all">
            <span className="text-[10px] font-mono opacity-40 uppercase font-bold">{edu.year}</span>
            <h4 className="text-sm font-space font-bold tracking-tight uppercase group-hover:text-glow transition-all">
              {edu.degree}
            </h4>
            <p className="font-mono text-[10px] text-primary/60 uppercase tracking-widest">
              {edu.institution}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

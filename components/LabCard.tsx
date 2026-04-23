'use client';

import React from 'react';
import type { LabModule } from '@/lib/useSiteConfig';

interface LabCardProps {
  module: LabModule;
  active: boolean;
  onSelect: (id: string) => void;
}

export const LabCard: React.FC<LabCardProps> = ({ module, active, onSelect }) => {
  return (
    <button
      onClick={() => onSelect(module.id)}
      className={`
        group relative flex flex-col p-4 text-left transition-all duration-300 border
        ${active 
          ? 'bg-primary text-black phosphor-glow border-primary' 
          : 'bg-surface/20 border-primary/5 hover:border-primary/40 hover:bg-primary/5'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[8px] font-mono uppercase tracking-widest ${active ? 'text-black/60' : 'opacity-30'}`}>
          {module.type}
        </span>
        <span className={`text-[8px] font-mono px-1 border ${active ? 'border-black/20 text-black' : 'border-primary/20 text-primary/40'}`}>
          {module.status}
        </span>
      </div>

      <h3 className={`text-md font-space font-bold tracking-tight mb-2 ${active ? 'text-black' : 'text-glow'}`}>
        &gt; {module.name}
      </h3>
      
      <p className={`text-[10px] font-mono leading-tight ${active ? 'text-black/80' : 'opacity-40'}`}>
        {module.description}
      </p>

      {active && (
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-black animate-pulse" />
      )}
    </button>
  );
};

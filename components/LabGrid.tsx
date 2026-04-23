'use client';

import React from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';
import type { LabModule } from '@/lib/useSiteConfig';
import { LabCard } from './LabCard';

interface LabGridProps {
  activeModuleId: string | null;
  onSelect: (id: string) => void;
}

export const LabGrid: React.FC<LabGridProps> = ({ activeModuleId, onSelect }) => {
  const { config, loading } = useSiteConfig();
  const modules = config?.labModules?.modules ?? [];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-mono tracking-[0.3em] opacity-40 uppercase border-b border-primary/10 pb-4">
        &gt; AVAILABLE_MODULE_INDEX
      </h3>
      
      {loading ? (
        <div className="text-primary/30 font-mono text-[10px] animate-pulse uppercase tracking-[0.5em]">
          LOADING MODULES...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 max-h-[65vh] overflow-y-auto scrollbar-hide pr-2 pb-8">
          {modules.map((module) => (
            <LabCard
              key={module.id}
              module={module}
              active={activeModuleId === module.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

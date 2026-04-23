'use client';

import React from 'react';

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  categories: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onFilterChange, categories }) => {
  return (
    <div className="flex flex-col gap-4 border-b border-primary/10 pb-6 mb-8">
      <h2 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; REPOSITORY_FILTER
      </h2>
      
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilterChange(cat)}
            className={`
              px-4 py-1 font-mono text-xs transition-all duration-300
              ${activeFilter === cat 
                ? 'bg-primary text-black phosphor-glow' 
                : 'bg-surface/30 text-primary/50 hover:text-primary hover:bg-primary/5'}
            `}
          >
            [{cat}]
          </button>
        ))}
      </div>
    </div>
  );
};

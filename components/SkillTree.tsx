'use client';

import React, { useState } from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const SkillTree: React.FC = () => {
  const { config, loading } = useSiteConfig();
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['frontend', 'backend']);

  const toggleNode = (node: string) => {
    setExpandedNodes((prev) =>
      prev.includes(node) ? prev.filter((n) => n !== node) : [...prev, node]
    );
  };

  if (loading || !config?.skills) {
    return (
      <div className="text-primary/30 font-mono text-[10px] animate-pulse uppercase tracking-[0.5em]">
        LOADING SKILL TREE...
      </div>
    );
  }

  const skills = config.skills;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center border-b border-primary/10 pb-4">
        <h3 className="text-sm font-mono tracking-[0.3em] opacity-40 uppercase">
          &gt; SKILL_ARCHITECTURE_TREE
        </h3>
        <div className="flex gap-2">
          <button className="text-[9px] border border-primary/20 px-2 opacity-40 hover:opacity-100 transition-all uppercase">Tree</button>
          <button className="text-[9px] border border-primary/20 px-2 opacity-40 hover:opacity-100 transition-all uppercase">Matrix</button>
        </div>
      </header>

      <div className="font-mono text-sm space-y-6">
        {Object.entries(skills).map(([category, skillList]) => {
          const isExpanded = expandedNodes.includes(category);
          return (
            <div key={category} className="space-y-2">
              <button
                onClick={() => toggleNode(category)}
                className="flex items-center gap-2 group w-full text-left"
              >
                <span className="text-primary font-bold">{isExpanded ? '[-]' : '[+]'}</span>
                <span
                  className={`uppercase font-bold tracking-widest ${
                    isExpanded ? 'text-glow' : 'opacity-40 group-hover:opacity-100'
                  } transition-all`}
                >
                  {category}/
                </span>
                <span className="flex-1 border-b border-primary/5 border-dotted" />
              </button>

              {isExpanded && (
                <div className="pl-6 grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8 animate-in slide-in-from-left anim-duration-300">
                  {(skillList as string[]).map((skill) => (
                    <div key={skill} className="flex items-center gap-2 group cursor-default">
                      <span className="text-[10px] opacity-20 group-hover:text-primary transition-colors">├──</span>
                      <span className="text-xs opacity-70 group-hover:text-glow group-hover:opacity-100 transition-all">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

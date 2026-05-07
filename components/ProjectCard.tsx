'use client';

import React from 'react';
import { FirestoreProject } from '@/app/archive/page';

interface ProjectCardProps {
  project: FirestoreProject;
  onSelect: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  const id = project.repoId ?? project.id ?? '';
  const displayName = project.displayName || project.name;
  const description = project.customDesc || project.description || '';

  return (
    <button
      onClick={() => onSelect(id)}
      aria-label={`${displayName} — ${description}`}
      className="group relative flex flex-col bg-surface/20 border border-primary/5 p-6 text-left transition-all duration-300 hover:bg-primary"
    >
      {/* Visual Anchor points */}
      <div className="absolute top-2 left-2 w-1 h-1 bg-primary group-hover:bg-black" />
      <div className="absolute top-2 right-2 w-1 h-1 bg-primary group-hover:bg-black" />
      
      <div className="flex justify-between items-start mb-4">
        <span className="text-[9px] font-mono opacity-40 group-hover:text-black/60">ID: {id}</span>
        {project.status && (
          <span className={`
            text-[9px] font-mono px-1 border
            group-hover:border-black/20 group-hover:text-black
            ${project.status === 'ACTIVE' ? 'border-primary text-primary' : 'border-primary/40 text-primary/40'}
          `}>
            {project.status}
          </span>
        )}
      </div>

      <h3 className="text-xl font-space font-bold tracking-tight text-glow group-hover:text-black group-hover:text-shadow-none mb-2">
        {displayName}
      </h3>
      
      <p className="text-xs font-mono opacity-70 group-hover:text-black line-clamp-2 leading-relaxed">
        {description}
      </p>

      <div className="mt-6 flex justify-between items-center">
        <span className="text-[10px] font-mono opacity-30 group-hover:text-black/40 uppercase">
          CAT: {project.category || 'N/A'}
        </span>
        <div className="flex items-center gap-3">
          {project.showWebsiteLink === true && project.websiteUrl && (
            <a
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[9px] font-mono border border-primary/40 text-primary group-hover:border-black/40 group-hover:text-black px-2 py-0.5 hover:bg-primary/10 group-hover:hover:bg-black/10 transition-colors uppercase"
            >
              ↗ LIVE
            </a>
          )}
          <span className="text-[9px] font-mono text-primary group-hover:text-black group-hover:font-bold">
            [ ACCESS_SYSTEM ]
          </span>
        </div>
      </div>
    </button>
  );
};

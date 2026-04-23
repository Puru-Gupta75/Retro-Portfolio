'use client';

import React from 'react';
import { FirestoreProject } from '@/app/archive/page';

interface ProjectDetailProps {
  project: FirestoreProject;
  onClose: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
  const displayName = project.displayName || project.name;
  const description = project.customDesc || project.longDescription || project.description || '';

  return (
    <div className="fixed inset-0 z-150 bg-black/90 backdrop-blur-md flex items-center justify-end">
      <div className="w-full max-w-4xl h-full bg-surface border-l border-primary/20 p-8 md:p-12 overflow-y-auto animate-in slide-in-from-right anim-duration-500">
        
        {/* HEADER */}
        <header className="flex justify-between items-start mb-12">
          <div className="space-y-4">
            <button 
              onClick={onClose}
              className="text-[10px] uppercase tracking-widest text-primary/40 hover:text-primary transition-colors mb-4 block"
            >
              [ RETURN_TO_ARCHIVE ]
            </button>
            <h2 className="text-4xl md:text-6xl font-space font-bold tracking-tighter text-glow animate-flicker">
              {displayName}
            </h2>
            <div className="flex gap-4">
              {project.status && (
                <span className="text-xs font-mono px-2 py-0.5 border border-primary text-primary">
                  STATUS: {project.status}
                </span>
              )}
              <span className="text-xs font-mono px-2 py-0.5 opacity-40 uppercase">
                CATEGORY: {project.category || 'N/A'}
              </span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="text-primary hover:text-glow text-xl font-mono"
          >
            [X]
          </button>
        </header>

        {/* CORE CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
          
          {/* LEFT COL: Description & Architecture */}
          <div className="lg:col-span-2 space-y-12">
            
            <section className="space-y-4">
              <h3 className="text-xs font-mono opacity-30 uppercase tracking-[0.3em]">
                &gt; SYSTEM_OVERVIEW
              </h3>
              <p className="font-mono text-lg leading-relaxed opacity-90">
                {description}
              </p>
            </section>

            {project.features && project.features.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-xs font-mono opacity-30 uppercase tracking-[0.3em]">
                  &gt; CORE_FEATURES
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-4 border-l border-primary/20 pl-4 py-2 bg-primary/5">
                      <span className="text-[10px] font-mono text-primary animate-pulse">●</span>
                      <span className="text-xs font-mono opacity-80 uppercase">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {project.systemFlow && (
              <section className="space-y-4">
                <h3 className="text-xs font-mono opacity-30 uppercase tracking-[0.3em]">
                  &gt; SYSTEM_FLOW_ARCHITECTURE
                </h3>
                <div className="bg-black/50 border border-primary/10 p-6 sm:p-8 select-none">
                  <div className="flex flex-col items-start gap-0 font-mono text-[10px] sm:text-xs text-primary/80 tracking-widest">
                    {project.systemFlow.split(' -> ').map((step, i, arr) => (
                      <React.Fragment key={step}>
                        <span className="px-3 py-1.5 border border-primary/30 bg-primary/5 w-full">
                          {step}
                        </span>
                        {i < arr.length - 1 && (
                          <span className="text-primary/40 pl-4 py-1 text-base leading-none">↓</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* RIGHT COL: Tech Stack & Actions */}
          <div className="space-y-12">
            {project.techStack && (
              <section className="space-y-6">
                <h3 className="text-xs font-mono opacity-30 uppercase tracking-[0.3em]">
                  &gt; STACK_TRACE
                </h3>
                
                {Object.entries(project.techStack).map(([layer, items]) => {
                  if (!items || (items as string[]).length === 0) return null;
                  return (
                    <div key={layer} className="space-y-2">
                      <h4 className="text-[10px] text-primary/60 uppercase font-bold">{layer}/</h4>
                      <ul className="space-y-1 pl-4 border-l border-primary/10">
                        {(items as string[]).map((item) => (
                          <li key={item} className="text-xs font-mono opacity-70">
                            ├── {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </section>
            )}

            <section className="space-y-4 pt-8">
              {project.showRepoLink === true && (project.repoUrl || project.url) && (
                <a
                  href={project.repoUrl || project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-primary text-black py-3 font-bold uppercase text-center transition-all hover:bg-glow phosphor-glow"
                >
                  VIEW_SOURCE_CODE
                </a>
              )}
              {project.showWebsiteLink === true && project.websiteUrl && (
                <a
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full border border-primary/40 text-primary py-3 font-bold uppercase text-center transition-all hover:bg-primary/10 hover:border-primary"
                >
                  LIVE_DEMO
                </a>
              )}
            </section>
          </div>

        </div>

        {/* FOOTER METADATA */}
        <div className="mt-24 pt-8 border-t border-primary/5 opacity-10 text-[9px] font-mono uppercase text-center tracking-[0.5em]">
          DATA_PACKET_END // SYNC_COMPLETED // (C) AMBER_SYSTEMS
        </div>
      </div>
    </div>
  );
};

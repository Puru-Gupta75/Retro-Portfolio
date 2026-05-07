'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';
import { FilterBar } from '@/components/FilterBar';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectDetail } from '@/components/ProjectDetail';

export interface FirestoreProject {
  // Firestore doc id
  repoId: string;
  // GitHub-sourced
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  lastUpdated: string;
  priorityScore: number;
  // Manual / admin fields
  displayName: string;
  customDesc: string;
  tags: string[];
  category: string;
  isFeatured: boolean;
  isHidden: boolean;
  repoUrl?: string;
  websiteUrl?: string;
  showRepoLink?: boolean;
  showWebsiteLink?: boolean;
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    other: string[];
  };
  features: string[];
  systemFlow: string;
  sortOrder: number;
  // Seed-only fields (present on seeded docs)
  id?: string;
  status?: string;
  longDescription?: string;
}

export default function ArchivePage() {
  const { config } = useSiteConfig();
  const archiveDesc = config?.identity?.pageContent?.archive?.description
    ?? 'CENTRAL REPOSITORY OF VERSION-CONTROLLED NODES AND SYSTEM ASSETS.';

  const [projects, setProjects] = useState<FirestoreProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'GRID' | 'TIMELINE'>('GRID');

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data: FirestoreProject[]) => {
        // Filter out hidden projects, sort by sortOrder then priorityScore
        const visible = data
          .filter((p) => !p.isHidden)
          .sort((a, b) => {
            const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
            if (orderDiff !== 0) return orderDiff;
            return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
          });
        setProjects(visible);
      })
      .catch(console.error)
      .finally(() => setLoadingProjects(false));
  }, []);

  // Derive category list from actual project data
  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category).filter(Boolean));
    return ['ALL', ...Array.from(cats)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'ALL') return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [activeFilter, projects]);

  const selectedProject = useMemo(
    () => projects.find((p) => (p.repoId ?? p.id) === selectedProjectId) ?? null,
    [selectedProjectId, projects]
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 anim-duration-1000">
      {/* HEADER */}
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-space font-bold tracking-[-0.04em] uppercase text-glow">
          &gt; ARCHIVE
        </h1>
        <p className="font-mono text-sm leading-relaxed opacity-80 max-w-2xl">
          {archiveDesc}
        </p>
      </header>

      {/* REPO CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          categories={categories}
        />

        <div className="flex gap-2 mb-6">
          <div className="text-[10px] font-mono opacity-30 uppercase self-center mr-2">ViewMode:</div>
          <button
            onClick={() => setViewMode('GRID')}
            className={`
              text-[10px] font-mono px-4 py-1 border transition-all whitespace-nowrap
              ${viewMode === 'GRID' ? 'border-primary text-primary bg-primary/10' : 'border-primary/20 text-primary/40'}
            `}
          >
            [ GRID ]
          </button>
          <button
            onClick={() => setViewMode('TIMELINE')}
            className={`
              text-[10px] font-mono px-4 py-1 border transition-all whitespace-nowrap
              ${viewMode === 'TIMELINE' ? 'border-primary text-primary bg-primary/10' : 'border-primary/20 text-primary/40'}
            `}
          >
            [ TIMELINE ]
          </button>
        </div>
      </div>

      {loadingProjects ? (
        <div className="py-20 text-center font-mono text-[10px] opacity-30 animate-pulse uppercase tracking-[0.5em]">
          FETCHING PROJECT REGISTRY...
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.repoId ?? project.id}
              project={project}
              onSelect={setSelectedProjectId}
            />
          ))}

          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center font-mono opacity-30 text-xs">
              &gt; NO_DATA_MATCHES_FILTER_QUERY
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12 pl-4 border-l border-primary/10">
          {filteredProjects.map((project) => {
            const id = project.repoId ?? project.id ?? '';
            return (
              <div key={id} className="relative pl-8 group">
                <div className="absolute left-[-5px] top-2 w-2 h-2 bg-primary/40 group-hover:bg-primary transition-colors" />
                <div className="space-y-2">
                  <span className="text-[10px] font-mono opacity-40">202X // 0x{id}</span>
                  <h3
                    className="text-2xl font-space font-bold cursor-pointer hover:text-glow transition-all"
                    onClick={() => setSelectedProjectId(id)}
                  >
                    {project.displayName || project.name}
                  </h3>
                  <p className="text-xs font-mono opacity-60 line-clamp-1">
                    {project.customDesc || project.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL OVERLAY */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProjectId(null)}
        />
      )}

      {/* SYSTEM META */}
      <footer className="pt-24 opacity-20 font-mono text-[9px] text-center uppercase tracking-[0.4em]">
        _ _ _ END_OF_PROJECT_INDEX // DATA_VALIDATED _ _ _
      </footer>
    </div>
  );
}

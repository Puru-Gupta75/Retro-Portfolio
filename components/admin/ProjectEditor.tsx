'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { systemStore } from '@/store/useSystemStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  other: string[];
}

interface Project {
  // GitHub-sourced (read-only in admin)
  repoId: string;
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  lastUpdated: string;
  priorityScore: number;

  // Manual fields (admin-editable)
  displayName: string;
  customDesc: string;
  tags: string[];
  category: string;
  isFeatured: boolean;
  isHidden: boolean;
  isVisible: boolean;
  repoUrl: string;
  websiteUrl: string;
  showRepoLink: boolean;
  showWebsiteLink: boolean;
  techStack: TechStack;
  features: string[];
  systemFlow: string;
  sortOrder: number;
}

type ManualFields = Pick<
  Project,
  | 'displayName'
  | 'customDesc'
  | 'tags'
  | 'category'
  | 'isFeatured'
  | 'isHidden'
  | 'isVisible'
  | 'repoUrl'
  | 'websiteUrl'
  | 'showRepoLink'
  | 'showWebsiteLink'
  | 'techStack'
  | 'features'
  | 'systemFlow'
  | 'sortOrder'
>;

const EMPTY_MANUAL: ManualFields = {
  displayName: '',
  customDesc: '',
  tags: [],
  category: '',
  isFeatured: false,
  isHidden: false,
  isVisible: true,
  repoUrl: '',
  websiteUrl: '',
  showRepoLink: true,
  showWebsiteLink: true,
  techStack: { frontend: [], backend: [], database: [], other: [] },
  features: [],
  systemFlow: '',
  sortOrder: 0,
};

const CATEGORIES = ['', 'FULLSTACK', 'AI', 'DATA', 'SYSTEM', 'TOOL', 'OTHER'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toManualFields(p: Project): ManualFields {
  return {
    displayName: p.displayName ?? '',
    customDesc: p.customDesc ?? '',
    tags: p.tags ?? [],
    category: p.category ?? '',
    isFeatured: p.isFeatured ?? false,
    isHidden: p.isHidden ?? false,
    isVisible: p.isVisible ?? true,
    repoUrl: p.repoUrl ?? '',
    websiteUrl: p.websiteUrl ?? '',
    showRepoLink: p.showRepoLink ?? true,
    showWebsiteLink: p.showWebsiteLink ?? true,
    techStack: p.techStack ?? { frontend: [], backend: [], database: [], other: [] },
    features: p.features ?? [],
    systemFlow: p.systemFlow ?? '',
    sortOrder: p.sortOrder ?? 0,
  };
}

function arrayField(value: string[] | undefined): string {
  return (value ?? []).join(', ');
}

function parseArray(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[9px] text-primary/40 uppercase tracking-widest font-mono">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-primary/5 border border-primary/20 p-2 text-primary font-mono text-xs focus:border-primary/60 outline-none transition-colors placeholder:text-primary/10"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full bg-primary/5 border border-primary/20 p-2 text-primary font-mono text-xs focus:border-primary/60 outline-none resize-none transition-colors placeholder:text-primary/10"
    />
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary w-4 h-4 cursor-pointer"
      />
      <span className="text-[10px] text-primary/40 group-hover:text-primary/80 uppercase tracking-widest font-mono transition-colors">
        {label}
      </span>
    </label>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProjectEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ManualFields>(EMPTY_MANUAL);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      // Use admin-authenticated endpoint — returns ALL projects including hidden ones
      const res = await fetch('/api/admin/projects');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: Project[] = await res.json();
      // Sort by sortOrder asc, then priorityScore desc
      data.sort((a, b) => {
        const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        if (orderDiff !== 0) return orderDiff;
        return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
      });
      setProjects(data);
    } catch (err) {
      console.error('ProjectEditor: failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const startEdit = (project: Project) => {
    setEditingId(project.repoId);
    setFormData(toManualFields(project));
    setSaveError(null);
    setSaveSuccess(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(EMPTY_MANUAL);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/project/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: formData }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        systemStore.addLog(`[SUCCESS] PROJECT UPDATED: ${id}`, 'ACTION');
        await fetchProjects();
        setTimeout(() => {
          setEditingId(null);
          setSaveSuccess(false);
        }, 1200);
      } else {
        const data = await res.json();
        const errMsg = data.error || 'UPDATE_FAILED';
        setSaveError(errMsg);
        systemStore.addLog(`[ERROR] PROJECT UPDATE FAILED: ${errMsg}`, 'ERROR');
      }
    } catch {
      setSaveError('NETWORK_ERROR');
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof ManualFields>(key: K, value: ManualFields[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const setTechStackField = (key: keyof TechStack, value: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: { ...prev.techStack, [key]: parseArray(value) },
    }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-primary/40 font-mono text-[10px] animate-pulse uppercase tracking-[0.5em]">
        FETCHING PROJECT REGISTRY...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[10px] font-mono tracking-[0.4em] opacity-30 uppercase">
        ── PROJECT_REGISTRY ({projects.length} NODES) ──────────────────────────────────
      </h2>

      <div className="grid gap-4">
        {projects.map((project, i) => {
          const isEditing = editingId === project.repoId;
          const id = project.repoId ?? String(i);

          return (
            <div
              key={id}
              className={`border p-4 transition-all ${
                isEditing
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-primary/10 hover:border-primary/30'
              }`}
            >
              {/* ── Header row ── */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 min-w-0">
                  <p className="text-[9px] text-primary/30 uppercase font-mono tracking-widest truncate">
                    {id} // {project.name}
                    {project.isFeatured && (
                      <span className="ml-2 text-primary">[FEATURED]</span>
                    )}
                    {project.isHidden && (
                      <span className="ml-2 text-red-500">[HIDDEN]</span>
                    )}
                  </p>
                  <h3 className="text-lg font-bold text-primary font-mono">
                    {project.displayName || project.name}
                  </h3>
                  <p className="text-[9px] text-primary/30 font-mono">
                    ★ {project.stars} · ⑂ {project.forks} · {project.language ?? 'N/A'}
                    {project.category ? ` · ${project.category}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => (isEditing ? cancelEdit() : startEdit(project))}
                  className="shrink-0 text-[9px] text-primary/40 hover:text-primary uppercase tracking-widest font-mono border border-primary/20 px-3 py-1 hover:border-primary/60 transition-all"
                >
                  {isEditing ? '[ CANCEL ]' : '[ EDIT ]'}
                </button>
              </div>

              {/* ── Edit form ── */}
              {isEditing && (
                <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2">
                  {/* Row 1: displayName + category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <FieldLabel>Display Title</FieldLabel>
                      <TextInput
                        value={formData.displayName}
                        onChange={(v) => setField('displayName', v)}
                        placeholder={project.name}
                      />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel>Category</FieldLabel>
                      <select
                        value={formData.category}
                        onChange={(e) => setField('category', e.target.value)}
                        className="w-full bg-primary/5 border border-primary/20 p-2 text-primary font-mono text-xs focus:border-primary/60 outline-none transition-colors"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c || '— NONE —'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 2: customDesc */}
                  <div className="space-y-1">
                    <FieldLabel>Custom Highlight / Description</FieldLabel>
                    <TextArea
                      value={formData.customDesc}
                      onChange={(v) => setField('customDesc', v)}
                      rows={3}
                    />
                  </div>

                  {/* Row 2b: URLs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <FieldLabel>Repository URL (override)</FieldLabel>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showRepoLink}
                            onChange={(e) => setField('showRepoLink', e.target.checked)}
                            className="accent-primary w-3 h-3"
                          />
                          <span className="text-[8px] font-mono text-primary/40 uppercase tracking-widest">Show</span>
                        </label>
                      </div>
                      <TextInput
                        value={formData.repoUrl}
                        onChange={(v) => setField('repoUrl', v)}
                        placeholder={project.url || 'https://github.com/...'}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <FieldLabel>Website / Live Demo URL</FieldLabel>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showWebsiteLink}
                            onChange={(e) => setField('showWebsiteLink', e.target.checked)}
                            className="accent-primary w-3 h-3"
                          />
                          <span className="text-[8px] font-mono text-primary/40 uppercase tracking-widest">Show</span>
                        </label>
                      </div>
                      <TextInput
                        value={formData.websiteUrl}
                        onChange={(v) => setField('websiteUrl', v)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Row 3: tags + sortOrder */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <FieldLabel>Tags (comma-separated)</FieldLabel>
                      <TextInput
                        value={arrayField(formData.tags)}
                        onChange={(v) => setField('tags', parseArray(v))}
                        placeholder="react, typescript, api"
                      />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel>Sort Order (lower = higher priority)</FieldLabel>
                      <input
                        type="number"
                        value={formData.sortOrder}
                        onChange={(e) => setField('sortOrder', Number(e.target.value))}
                        className="w-full bg-primary/5 border border-primary/20 p-2 text-primary font-mono text-xs focus:border-primary/60 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 4: techStack */}
                  <div className="space-y-2">
                    <FieldLabel>Tech Stack</FieldLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 border-l border-primary/10">
                      {(['frontend', 'backend', 'database', 'other'] as const).map((layer) => (
                        <div key={layer} className="space-y-1">
                          <FieldLabel>{layer}</FieldLabel>
                          <TextInput
                            value={arrayField(formData.techStack?.[layer])}
                            onChange={(v) => setTechStackField(layer, v)}
                            placeholder="React, TypeScript"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row 5: features */}
                  <div className="space-y-1">
                    <FieldLabel>Features (comma-separated)</FieldLabel>
                    <TextInput
                      value={arrayField(formData.features)}
                      onChange={(v) => setField('features', parseArray(v))}
                      placeholder="AUTH_SYSTEM, REALTIME_SYNC, DARK_MODE"
                    />
                  </div>

                  {/* Row 6: systemFlow */}
                  <div className="space-y-1">
                    <FieldLabel>System Flow</FieldLabel>
                    <TextInput
                      value={formData.systemFlow}
                      onChange={(v) => setField('systemFlow', v)}
                      placeholder="USER -> UI -> API -> DB"
                    />
                  </div>

                  {/* Row 7: flags */}
                  <div className="flex flex-wrap gap-8">
                    <Checkbox
                      checked={formData.isFeatured}
                      onChange={(v) => setField('isFeatured', v)}
                      label="Featured"
                    />
                    <Checkbox
                      checked={formData.isHidden}
                      onChange={(v) => setField('isHidden', v)}
                      label="Hidden"
                    />
                  </div>

                  {/* GitHub read-only info */}
                  <div className="border border-primary/10 p-3 space-y-1 bg-primary/5">
                    <p className="text-[8px] text-primary/30 uppercase tracking-widest font-mono mb-2">
                      ── GITHUB DATA (READ-ONLY) ──
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[9px] font-mono text-primary/30">
                      <span>STARS: {project.stars}</span>
                      <span>FORKS: {project.forks}</span>
                      <span>LANG: {project.language ?? 'N/A'}</span>
                      <span>SCORE: {project.priorityScore}</span>
                    </div>
                    {(project.topics ?? []).length > 0 && (
                      <p className="text-[9px] font-mono text-primary/30">
                        TOPICS: {(project.topics ?? []).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Status messages */}
                  {saveError && (
                    <p className="text-[9px] text-red-500 uppercase tracking-widest font-mono animate-pulse">
                      !! ERROR: {saveError} !!
                    </p>
                  )}
                  {saveSuccess && (
                    <p className="text-[9px] text-green-500 uppercase tracking-widest font-mono">
                      ✓ CHANGES COMMITTED
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    onClick={() => handleUpdate(id)}
                    disabled={saving}
                    className="w-full bg-primary text-black font-mono font-bold text-xs p-3 tracking-[0.4em] uppercase hover:bg-glow transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed phosphor-glow"
                  >
                    {saving ? 'COMMITTING...' : '[ COMMIT_CHANGES ]'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

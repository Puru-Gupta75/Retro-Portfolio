
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { systemStore } from '@/store/useSystemStore';
import { invalidateSiteConfig } from '@/lib/useSiteConfig';
import type {
  IdentityData,
  SkillsData,
  ExperienceEntry,
  EducationEntry,
  UplinkCommand,
  LabModule,
  NavItem,
  SystemStat,
} from '@/lib/useSiteConfig';

// ─── Shared primitives ────────────────────────────────────────────────────────

function FL({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[9px] text-primary/40 uppercase tracking-widest font-mono block mb-1">
      {children}
    </label>
  );
}

function TI({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-primary/5 border border-primary/20 p-2 text-primary font-mono text-xs focus:border-primary/60 outline-none transition-colors ${className}`}
    />
  );
}

function TA({
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
      className="w-full bg-primary/5 border border-primary/20 p-2 text-primary font-mono text-xs focus:border-primary/60 outline-none resize-none transition-colors"
    />
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[9px] font-mono tracking-[0.4em] text-primary/40 uppercase border-b border-primary/10 pb-2 mb-4">
      ── {children} ──
    </h3>
  );
}

function SaveBar({
  saving,
  error,
  success,
  onSave,
  label = 'COMMIT',
}: {
  saving: boolean;
  error: string | null;
  success: boolean;
  onSave: () => void;
  label?: string;
}) {
  return (
    <div className="pt-4 space-y-2">
      {error && (
        <p className="text-[9px] text-red-500 uppercase tracking-widest font-mono animate-pulse">
          !! ERROR: {error} !!
        </p>
      )}
      {success && (
        <p className="text-[9px] text-green-500 uppercase tracking-widest font-mono">
          ✓ COMMITTED
        </p>
      )}
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full bg-primary text-black font-mono font-bold text-xs p-3 tracking-[0.4em] uppercase hover:bg-glow phosphor-glow transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? 'COMMITTING...' : `[ ${label} ]`}
      </button>
    </div>
  );
}

// ─── useSave hook ─────────────────────────────────────────────────────────────

function useSave(docName: string, logLabel: string) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const save = useCallback(
    async (updates: Record<string, any>, onSuccess?: () => void) => {
      setSaving(true);
      setError(null);
      setSuccess(false);
      try {
        const res = await fetch('/api/admin/site-config', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doc: docName, updates }),
        });
        if (res.ok) {
          setSuccess(true);
          invalidateSiteConfig();
          systemStore.addLog(`[SUCCESS] ${logLabel} UPDATED`, 'ACTION');
          onSuccess?.();
          setTimeout(() => setSuccess(false), 3000);
        } else {
          const d = await res.json();
          const msg = d.error || 'UPDATE_FAILED';
          setError(msg);
          systemStore.addLog(`[ERROR] ${logLabel} UPDATE FAILED: ${msg}`, 'ERROR');
        }
      } catch {
        setError('NETWORK_ERROR');
        systemStore.addLog(`[ERROR] ${logLabel} UPDATE FAILED: NETWORK_ERROR`, 'ERROR');
      } finally {
        setSaving(false);
      }
    },
    [docName, logLabel]
  );

  return { save, saving, error, success };
}

// ─── 1. Identity Editor ───────────────────────────────────────────────────────

function IdentityEditor() {
  const [data, setData] = useState<IdentityData | null>(null);
  const [loading, setLoading] = useState(true);
  const { save, saving, error, success } = useSave('identity', 'IDENTITY');

  useEffect(() => {
    fetch('/api/admin/site-config?doc=identity')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return <p className="text-primary/30 font-mono text-[10px] animate-pulse">LOADING...</p>;

  const set = (key: keyof IdentityData, val: string) =>
    setData((prev) => prev ? { ...prev, [key]: val } : prev);

  const setPage = (page: keyof IdentityData['pageContent'], field: 'title' | 'description', val: string) =>
    setData((prev) => prev ? {
      ...prev,
      pageContent: { ...prev.pageContent, [page]: { ...prev.pageContent[page], [field]: val } },
    } : prev);

  return (
    <div className="space-y-6">
      <SectionHeader>HERO / SYSTEM IDENTITY</SectionHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><FL>System Name</FL><TI value={data.systemName} onChange={(v) => set('systemName', v)} placeholder="PURU_GUPTA" /></div>
        <div><FL>System Status</FL><TI value={data.systemStatus} onChange={(v) => set('systemStatus', v)} placeholder="SYSTEM_ONLINE" /></div>
        <div className="md:col-span-2"><FL>System Tagline</FL><TI value={data.systemTagline} onChange={(v) => set('systemTagline', v)} /></div>
      </div>

      <SectionHeader>PROFILE IDENTITY PANEL</SectionHeader>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><FL>Profile System ID</FL><TI value={data.profileSystemId} onChange={(v) => set('profileSystemId', v)} placeholder="USER_772090" /></div>
        <div><FL>Profile Status</FL><TI value={data.profileStatus} onChange={(v) => set('profileStatus', v)} placeholder="ACTIVE_NODE" /></div>
        <div><FL>Profile Role</FL><TI value={data.profileRole} onChange={(v) => set('profileRole', v)} placeholder="FULL_STACK_ENGINEER" /></div>
        <div><FL>Profile Tagline</FL><TI value={data.profileTagline} onChange={(v) => set('profileTagline', v)} /></div>
      </div>

      <SectionHeader>PAGE DESCRIPTIONS</SectionHeader>
      <div className="space-y-4">
        {(Object.keys(data.pageContent) as Array<keyof IdentityData['pageContent']>).map((page) => (
          <div key={page} className="pl-3 border-l border-primary/10 space-y-2">
            <p className="text-[9px] text-primary/50 uppercase font-mono tracking-widest">{page}/</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><FL>Title</FL><TI value={data.pageContent[page].title} onChange={(v) => setPage(page, 'title', v)} /></div>
              <div><FL>Description</FL><TI value={data.pageContent[page].description} onChange={(v) => setPage(page, 'description', v)} /></div>
            </div>
          </div>
        ))}
      </div>

      <SaveBar saving={saving} error={error} success={success} onSave={() => save(data)} label="COMMIT_IDENTITY" />
    </div>
  );
}

// ─── 2. Skills Editor ─────────────────────────────────────────────────────────

function SkillsEditor() {
  const [data, setData] = useState<SkillsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { save, saving, error, success } = useSave('skills', 'SKILLS');

  useEffect(() => {
    fetch('/api/admin/site-config?doc=skills')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return <p className="text-primary/30 font-mono text-[10px] animate-pulse">LOADING...</p>;

  const setCategory = (key: string, val: string) =>
    setData((prev) => prev ? { ...prev, [key]: val.split(',').map((s) => s.trim()).filter(Boolean) } : prev);

  return (
    <div className="space-y-4">
      <SectionHeader>SKILL CATEGORIES</SectionHeader>
      <p className="text-[9px] text-primary/30 font-mono">Comma-separated values per category.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data)
          .filter(([k]) => !['lastModifiedAt', 'modifiedBy'].includes(k))
          .map(([category, skills]) => (
            <div key={category}>
              <FL>{category}/</FL>
              <TI
                value={(skills as string[]).join(', ')}
                onChange={(v) => setCategory(category, v)}
                placeholder="React, TypeScript, ..."
              />
            </div>
          ))}
      </div>
      <SaveBar saving={saving} error={error} success={success} onSave={() => save(data)} label="COMMIT_SKILLS" />
    </div>
  );
}

// ─── 3. Experience Editor ─────────────────────────────────────────────────────

function ExperienceEditor() {
  const [entries, setEntries] = useState<ExperienceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { save, saving, error, success } = useSave('experience', 'EXPERIENCE');

  useEffect(() => {
    fetch('/api/admin/site-config?doc=experience')
      .then((r) => r.json())
      .then((d) => { setEntries(d.entries ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-primary/30 font-mono text-[10px] animate-pulse">LOADING...</p>;

  const update = (i: number, key: keyof ExperienceEntry, val: string) =>
    setEntries((prev) => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  const add = () => setEntries((prev) => [...prev, { year: '', role: '', description: '' }]);
  const remove = (i: number) => setEntries((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <SectionHeader>EXPERIENCE TIMELINE</SectionHeader>
      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div key={i} className="border border-primary/10 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-primary/50 font-mono uppercase tracking-widest">Entry [{i + 1}]</span>
              <button onClick={() => remove(i)} className="text-[9px] text-red-700 hover:text-red-500 font-mono uppercase tracking-widest border border-red-900/30 px-2 py-0.5 hover:border-red-500 transition-all">
                [ REMOVE ]
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><FL>Year</FL><TI value={entry.year} onChange={(v) => update(i, 'year', v)} placeholder="2025" /></div>
              <div><FL>Role</FL><TI value={entry.role} onChange={(v) => update(i, 'role', v)} placeholder="LEAD_DEV @ COMPANY" /></div>
            </div>
            <div><FL>Description</FL><TA value={entry.description} onChange={(v) => update(i, 'description', v)} rows={2} /></div>
          </div>
        ))}
      </div>
      <button onClick={add} className="w-full border border-primary/20 text-primary/50 font-mono text-xs p-2 tracking-widest uppercase hover:border-primary/60 hover:text-primary transition-all">
        [ + ADD ENTRY ]
      </button>
      <SaveBar saving={saving} error={error} success={success} onSave={() => save({ entries })} label="COMMIT_EXPERIENCE" />
    </div>
  );
}

// ─── 4. Education Editor ──────────────────────────────────────────────────────

function EducationEditor() {
  const [entries, setEntries] = useState<EducationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { save, saving, error, success } = useSave('education', 'EDUCATION');

  useEffect(() => {
    fetch('/api/admin/site-config?doc=education')
      .then((r) => r.json())
      .then((d) => { setEntries(d.entries ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-primary/30 font-mono text-[10px] animate-pulse">LOADING...</p>;

  const update = (i: number, key: keyof EducationEntry, val: string) =>
    setEntries((prev) => prev.map((e, idx) => idx === i ? { ...e, [key]: val } : e));

  const add = () => setEntries((prev) => [...prev, { degree: '', institution: '', year: '' }]);
  const remove = (i: number) => setEntries((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <SectionHeader>EDUCATION</SectionHeader>
      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div key={i} className="border border-primary/10 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-primary/50 font-mono uppercase tracking-widest">Entry [{i + 1}]</span>
              <button onClick={() => remove(i)} className="text-[9px] text-red-700 hover:text-red-500 font-mono uppercase tracking-widest border border-red-900/30 px-2 py-0.5 hover:border-red-500 transition-all">
                [ REMOVE ]
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2"><FL>Degree</FL><TI value={entry.degree} onChange={(v) => update(i, 'degree', v)} placeholder="B.TECH COMPUTER SCIENCE" /></div>
              <div><FL>Year</FL><TI value={entry.year} onChange={(v) => update(i, 'year', v)} placeholder="2021-2025" /></div>
            </div>
            <div><FL>Institution</FL><TI value={entry.institution} onChange={(v) => update(i, 'institution', v)} placeholder="TECH_INSTITUTE_OF_DELHI" /></div>
          </div>
        ))}
      </div>
      <button onClick={add} className="w-full border border-primary/20 text-primary/50 font-mono text-xs p-2 tracking-widest uppercase hover:border-primary/60 hover:text-primary transition-all">
        [ + ADD ENTRY ]
      </button>
      <SaveBar saving={saving} error={error} success={success} onSave={() => save({ entries })} label="COMMIT_EDUCATION" />
    </div>
  );
}

// ─── 5. Achievements Editor ───────────────────────────────────────────────────

function AchievementsEditor() {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { save, saving, error, success } = useSave('achievements', 'ACHIEVEMENTS');

  useEffect(() => {
    fetch('/api/admin/site-config?doc=achievements')
      .then((r) => r.json())
      .then((d) => { setItems(d.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-primary/30 font-mono text-[10px] animate-pulse">LOADING...</p>;

  const update = (i: number, val: string) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? val : item));
  const add = () => setItems((prev) => [...prev, '']);
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <SectionHeader>ACHIEVEMENTS</SectionHeader>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="text-[9px] text-primary/30 font-mono w-6 shrink-0">[{i + 1}]</span>
            <TI value={item} onChange={(v) => update(i, v)} placeholder="ACHIEVEMENT_TITLE" className="flex-1" />
            <button onClick={() => remove(i)} className="text-[9px] text-red-700 hover:text-red-500 font-mono border border-red-900/30 px-2 py-1.5 hover:border-red-500 transition-all shrink-0">
              ✕
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="w-full border border-primary/20 text-primary/50 font-mono text-xs p-2 tracking-widest uppercase hover:border-primary/60 hover:text-primary transition-all">
        [ + ADD ACHIEVEMENT ]
      </button>
      <SaveBar saving={saving} error={error} success={success} onSave={() => save({ items })} label="COMMIT_ACHIEVEMENTS" />
    </div>
  );
}

// ─── 6. Uplink Editor ─────────────────────────────────────────────────────────

function UplinkEditor() {
  const [commands, setCommands] = useState<UplinkCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const { save, saving, error, success } = useSave('uplink', 'UPLINK');

  useEffect(() => {
    fetch('/api/admin/site-config?doc=uplink')
      .then((r) => r.json())
      .then((d) => {
        setCommands(d.commands ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-primary/30 font-mono text-[10px] animate-pulse">LOADING...</p>;

  const updateCmd = (i: number, key: keyof UplinkCommand, val: string) =>
    setCommands((prev) => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c));
  const addCmd = () => setCommands((prev) => [...prev, { cmd: '', label: '', url: '' }]);
  const removeCmd = (i: number) => setCommands((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <SectionHeader>QUICK COMMANDS</SectionHeader>
      <p className="text-[9px] text-primary/30 font-mono">
        STATUS_MESSAGES and ERROR_MESSAGES are managed via manual data editing only.
      </p>
      <div className="space-y-3">
        {commands.map((cmd, i) => (
          <div key={i} className="border border-primary/10 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-primary/50 font-mono uppercase">CMD [{i + 1}]</span>
              <button onClick={() => removeCmd(i)} className="text-[9px] text-red-700 hover:text-red-500 font-mono border border-red-900/30 px-2 py-0.5 hover:border-red-500 transition-all">[ REMOVE ]</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><FL>CMD Key</FL><TI value={cmd.cmd} onChange={(v) => updateCmd(i, 'cmd', v)} placeholder="GITHUB" /></div>
              <div><FL>Label</FL><TI value={cmd.label} onChange={(v) => updateCmd(i, 'label', v)} placeholder="OPEN_PROFILE" /></div>
              <div><FL>URL</FL><TI value={cmd.url ?? ''} onChange={(v) => updateCmd(i, 'url', v)} placeholder="https://..." /></div>
              <div><FL>Copy Value (optional)</FL><TI value={cmd.value ?? ''} onChange={(v) => updateCmd(i, 'value', v)} placeholder="email@domain.com" /></div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addCmd} className="w-full border border-primary/20 text-primary/50 font-mono text-xs p-2 tracking-widest uppercase hover:border-primary/60 hover:text-primary transition-all">
        [ + ADD COMMAND ]
      </button>

      <SaveBar saving={saving} error={error} success={success} onSave={() => save({ commands })} label="COMMIT_UPLINK" />
    </div>
  );
}

// ─── 7. Navigation Editor ─────────────────────────────────────────────────────

function NavigationEditor() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { save, saving, error, success } = useSave('navigation', 'NAVIGATION');

  useEffect(() => {
    fetch('/api/admin/site-config?doc=navigation')
      .then((r) => r.json())
      .then((d) => { setItems(d.items ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-primary/30 font-mono text-[10px] animate-pulse">LOADING...</p>;

  const update = (i: number, key: keyof NavItem, val: string) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [key]: val } : item));
  const add = () => setItems((prev) => [...prev, { id: String(prev.length + 1).padStart(2, '0'), label: '', path: '/' }]);
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <SectionHeader>NAVIGATION ITEMS</SectionHeader>
      <p className="text-[9px] text-primary/30 font-mono">Order determines keyboard shortcut number.</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="w-12 shrink-0"><FL>ID</FL><TI value={item.id} onChange={(v) => update(i, 'id', v)} /></div>
            <div className="flex-1"><FL>Label</FL><TI value={item.label} onChange={(v) => update(i, 'label', v)} placeholder="HOME" /></div>
            <div className="flex-1"><FL>Path</FL><TI value={item.path} onChange={(v) => update(i, 'path', v)} placeholder="/" /></div>
            <button onClick={() => remove(i)} className="text-[9px] text-red-700 hover:text-red-500 font-mono border border-red-900/30 px-2 py-1.5 hover:border-red-500 transition-all shrink-0 mb-0.5">✕</button>
          </div>
        ))}
      </div>
      <button onClick={add} className="w-full border border-primary/20 text-primary/50 font-mono text-xs p-2 tracking-widest uppercase hover:border-primary/60 hover:text-primary transition-all">
        [ + ADD NAV ITEM ]
      </button>
      <SaveBar saving={saving} error={error} success={success} onSave={() => save({ items })} label="COMMIT_NAVIGATION" />
    </div>
  );
}

// ─── 8. System Stats Editor ───────────────────────────────────────────────────

function SystemStatsEditor() {
  const [stats, setStats] = useState<SystemStat[]>([]);
  const [loading, setLoading] = useState(true);
  const { save, saving, error, success } = useSave('systemStats', 'SYSTEM_STATS');

  useEffect(() => {
    fetch('/api/admin/site-config?doc=systemStats')
      .then((r) => r.json())
      .then((d) => { setStats(d.stats ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-primary/30 font-mono text-[10px] animate-pulse">LOADING...</p>;

  const update = (i: number, key: keyof SystemStat, val: string) =>
    setStats((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
  const add = () => setStats((prev) => [...prev, { label: '', value: '' }]);
  const remove = (i: number) => setStats((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <SectionHeader>SYSTEM STATS (HOME PAGE)</SectionHeader>
      <div className="space-y-2">
        {stats.map((stat, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1"><FL>Label</FL><TI value={stat.label} onChange={(v) => update(i, 'label', v)} placeholder="MODULES" /></div>
            <div className="flex-1"><FL>Value</FL><TI value={stat.value} onChange={(v) => update(i, 'value', v)} placeholder="06_ACTIVE" /></div>
            <button onClick={() => remove(i)} className="text-[9px] text-red-700 hover:text-red-500 font-mono border border-red-900/30 px-2 py-1.5 hover:border-red-500 transition-all shrink-0 mb-0.5">✕</button>
          </div>
        ))}
      </div>
      <button onClick={add} className="w-full border border-primary/20 text-primary/50 font-mono text-xs p-2 tracking-widest uppercase hover:border-primary/60 hover:text-primary transition-all">
        [ + ADD STAT ]
      </button>
      <SaveBar saving={saving} error={error} success={success} onSave={() => save({ stats })} label="COMMIT_STATS" />
    </div>
  );
}

// ─── 9. Lab Modules Editor ────────────────────────────────────────────────────

const LAB_TYPES = ['ANALYZER', 'DATA_VISUAL', 'SIMULATOR'];
const LAB_STATUSES = ['EXPERIMENTAL', 'TESTING', 'PROTOTYPE'];

function LabModulesEditor() {
  const [modules, setModules] = useState<LabModule[]>([]);
  const [loading, setLoading] = useState(true);
  const { save, saving, error, success } = useSave('labModules', 'LAB_MODULES');

  useEffect(() => {
    fetch('/api/admin/site-config?doc=labModules')
      .then((r) => r.json())
      .then((d) => { setModules(d.modules ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-primary/30 font-mono text-[10px] animate-pulse">LOADING...</p>;

  const update = (i: number, key: keyof LabModule, val: string) =>
    setModules((prev) => prev.map((m, idx) => idx === i ? { ...m, [key]: val } : m));
  const add = () => setModules((prev) => [...prev, { id: `LAB-0${prev.length + 1}`, name: '', type: 'ANALYZER', status: 'EXPERIMENTAL', description: '' }]);
  const remove = (i: number) => setModules((prev) => prev.filter((_, idx) => idx !== i));

  const selectClass = "w-full bg-primary/5 border border-primary/20 p-2 text-primary font-mono text-xs focus:border-primary/60 outline-none transition-colors";

  return (
    <div className="space-y-4">
      <SectionHeader>LAB MODULES</SectionHeader>
      <div className="space-y-4">
        {modules.map((mod, i) => (
          <div key={i} className="border border-primary/10 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-primary/50 font-mono uppercase">{mod.id || `Module [${i + 1}]`}</span>
              <button onClick={() => remove(i)} className="text-[9px] text-red-700 hover:text-red-500 font-mono border border-red-900/30 px-2 py-0.5 hover:border-red-500 transition-all">[ REMOVE ]</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><FL>ID</FL><TI value={mod.id} onChange={(v) => update(i, 'id', v)} placeholder="LAB-01" /></div>
              <div><FL>Name</FL><TI value={mod.name} onChange={(v) => update(i, 'name', v)} placeholder="SENTIMENT_NODE" /></div>
              <div>
                <FL>Type</FL>
                <select value={mod.type} onChange={(e) => update(i, 'type', e.target.value)} className={selectClass}>
                  {LAB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <FL>Status</FL>
                <select value={mod.status} onChange={(e) => update(i, 'status', e.target.value)} className={selectClass}>
                  {LAB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><FL>Description</FL><TA value={mod.description} onChange={(v) => update(i, 'description', v)} rows={2} /></div>
          </div>
        ))}
      </div>
      <button onClick={add} className="w-full border border-primary/20 text-primary/50 font-mono text-xs p-2 tracking-widest uppercase hover:border-primary/60 hover:text-primary transition-all">
        [ + ADD MODULE ]
      </button>
      <SaveBar saving={saving} error={error} success={success} onSave={() => save({ modules })} label="COMMIT_LAB_MODULES" />
    </div>
  );
}

// ─── Root SiteConfigEditor ────────────────────────────────────────────────────

type SiteTab =
  | 'IDENTITY'
  | 'SKILLS'
  | 'EXPERIENCE'
  | 'EDUCATION'
  | 'ACHIEVEMENTS'
  | 'UPLINK';

const SITE_TABS: SiteTab[] = [
  'IDENTITY',
  'SKILLS',
  'EXPERIENCE',
  'EDUCATION',
  'ACHIEVEMENTS',
  'UPLINK',
];

export function SiteConfigEditor() {
  const [activeTab, setActiveTab] = useState<SiteTab>('IDENTITY');

  return (
    <div className="space-y-6">
      <h2 className="text-[10px] font-mono tracking-[0.4em] opacity-30 uppercase">
        ── SITE_CONFIG_REGISTRY ──────────────────────────────────
      </h2>

      {/* Sub-tab nav */}
      <nav className="flex flex-wrap gap-1 border-b border-primary/10 pb-0">
        {SITE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[9px] font-mono uppercase tracking-[0.2em] px-3 py-2 border-b-2 transition-all ${
              activeTab === tab
                ? 'border-primary/60 text-primary'
                : 'border-transparent text-primary/30 hover:text-primary/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Tab panels */}
      <div className="border border-primary/10 p-6">
        {activeTab === 'IDENTITY'     && <IdentityEditor />}
        {activeTab === 'SKILLS'       && <SkillsEditor />}
        {activeTab === 'EXPERIENCE'   && <ExperienceEditor />}
        {activeTab === 'EDUCATION'    && <EducationEditor />}
        {activeTab === 'ACHIEVEMENTS' && <AchievementsEditor />}
        {activeTab === 'UPLINK'       && <UplinkEditor />}
      </div>
    </div>
  );
}

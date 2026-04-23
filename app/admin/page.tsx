'use client';

import React, { useState, useEffect } from 'react';
import { ProjectEditor } from '@/components/admin/ProjectEditor';
import { SiteConfigEditor } from '@/components/admin/SiteConfigEditor';
import { systemStore } from '@/store/useSystemStore';
import { useRouter } from 'next/navigation';

type AdminTab = 'PROJECTS' | 'SITE';

export default function AdminPage() {
  const [adminState, setAdminState] = useState(() => systemStore.getState());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('PROJECTS');
  const router = useRouter();

  // 1. Subscribe to runtime state
  useEffect(() => {
    return systemStore.subscribe(() => {
      setAdminState(systemStore.getState());
    });
  }, []);

  // 2. Strict protection: if module not activated, redirect to home
  useEffect(() => {
    if (!adminState.adminModuleActive) {
      router.push('/');
    }
  }, [adminState.adminModuleActive, router]);

  const handleDisconnect = async () => {
    systemStore.addLog('[SYSTEM] DISCONNECTING ADMIN RUNTIME...', 'ACTION');
    // Invalidate server-side session cookie
    await fetch('/api/admin/logout', { method: 'POST' });
    systemStore.resetAdminState();
    router.push('/');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    systemStore.setAdminLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        systemStore.setAdminAuthenticated(true);
        systemStore.setAdminSessionValid(true);
        systemStore.addLog('[SUCCESS] AUTHENTICATED: ACCESS_GRANTED', 'ACTION');
      } else {
        const data = await res.json();
        setError(data.error || 'INVALID CREDENTIALS');
        systemStore.addLog(`[ERROR] AUTH_FAILURE: ${data.error || 'INVALID'}`, 'ERROR');
      }
    } catch {
      setError('CONNECTION FAILURE');
    } finally {
      setLoading(false);
      systemStore.setAdminLoading(false);
    }
  };

  if (!adminState.adminModuleActive) return null;

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!adminState.adminAuthenticated) {
    return (
      <div className="flex items-start justify-center pt-0 px-6 animate-in fade-in duration-500">
        <div className="w-full max-w-sm space-y-8 border border-primary/20 p-8 bg-primary/5 backdrop-blur-sm shadow-[0_0_50px_rgba(var(--primary-rgb),0.05)]">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-primary tracking-[0.3em] uppercase font-mono">
              ADMIN_ACCESS
            </h1>
            <p className="text-[10px] text-primary/40 uppercase tracking-widest">
              EPHEMERAL PRIVILEGED MODULE :: AUTH REQUIRED
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-primary/40 uppercase tracking-widest ml-1">
                  ID_NAME
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-primary/5 border border-primary/20 p-3 text-primary font-mono text-xs focus:border-primary/60 outline-none transition-all placeholder:text-primary/10"
                  placeholder="ID_IDENTIFIER"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] text-primary/40 uppercase tracking-widest ml-1">
                  ACCESS_KEY
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-primary/5 border border-primary/20 p-3 text-primary font-mono text-xs focus:border-primary/60 outline-none transition-all placeholder:text-primary/10"
                  placeholder="********"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <p className="text-[9px] text-red-500 text-center uppercase tracking-widest animate-pulse font-bold">
                !! ERROR: {error} !!
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-primary/40 p-3 text-primary font-mono text-xs tracking-[0.4em] uppercase hover:bg-primary/10 transition-all active:scale-95 disabled:opacity-30"
            >
              {loading ? 'VERIFYING...' : '[ LOGIN ]'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Authenticated admin panel ─────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <main className="space-y-12">
        {/* Header */}
        <header className="space-y-4 border-b border-primary/10 pb-8">
          <div className="flex justify-between items-end">
            <h1 className="text-4xl md:text-6xl font-space font-bold tracking-[-0.04em] uppercase text-primary">
              &gt; ADMIN
            </h1>
            <button
              onClick={handleDisconnect}
              className="text-[10px] text-primary/40 hover:text-primary uppercase tracking-widest transition-colors mb-2 border border-primary/10 px-3 py-1 hover:border-primary/40"
            >
              [ TERMINATE_SESSION ]
            </button>
          </div>
          <p className="font-mono text-sm leading-relaxed opacity-80 text-primary/60 max-w-2xl">
            PRIVILEGED RUNTIME :: SECURE ADMINISTRATIVE ACCESS FOR MANUAL DATA OVERRIDES.
            ALL WRITES ARE ADMIN-ONLY. SYNC ENGINE CANNOT TOUCH MANUAL DATA.
          </p>
        </header>

        {/* Tab navigation */}
        <nav className="flex gap-2 border-b border-primary/10 pb-0">
          {(['PROJECTS', 'SITE'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[10px] font-mono uppercase tracking-[0.3em] px-4 py-2 border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-primary/30 hover:text-primary/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div>
          {activeTab === 'PROJECTS' && <ProjectEditor />}
          {activeTab === 'SITE' && <SiteConfigEditor />}
        </div>
      </main>
    </div>
  );
}

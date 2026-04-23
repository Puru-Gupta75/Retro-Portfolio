'use client';

import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  path: string;
}

export interface IdentityData {
  systemName: string;
  systemStatus: string;
  systemTagline: string;
  profileSystemId: string;
  profileRole: string;
  profileTagline: string;
  profileStatus: string;
  pageContent: {
    home: { title: string; description: string };
    profile: { title: string; description: string };
    archive: { title: string; description: string };
    uplink: { title: string; description: string };
    system: { title: string; description: string };
    admin: { title: string; description: string };
  };
}

export interface SkillsData {
  frontend: string[];
  backend: string[];
  data: string[];
  tools: string[];
  [key: string]: string[];
}

export interface ExperienceEntry {
  year: string;
  role: string;
  description: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
}

export interface UplinkCommand {
  cmd: string;
  label: string;
  url?: string;
  action?: string;
  value?: string;
}

export interface LabModule {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
}

export interface SystemStat {
  label: string;
  value: string;
}

export interface SiteConfig {
  identity: IdentityData | null;
  navigation: { items: NavItem[] } | null;
  systemStats: { stats: SystemStat[] } | null;
  skills: SkillsData | null;
  experience: { entries: ExperienceEntry[] } | null;
  education: { entries: EducationEntry[] } | null;
  achievements: { items: string[] } | null;
  uplink: {
    commands: UplinkCommand[];
    statusMsgs: string[];
    errors: string[];
  } | null;
  labModules: { modules: LabModule[] } | null;
}

// ─── Module-level cache ───────────────────────────────────────────────────────
// Shared across all component instances — fetched once per page load.

let cache: SiteConfig | null = null;
let fetchPromise: Promise<SiteConfig> | null = null;

/** Call after admin writes to force a fresh fetch on next render. */
export function invalidateSiteConfig() {
  cache = null;
  fetchPromise = null;
}

async function fetchSiteConfig(): Promise<SiteConfig> {
  if (cache) return cache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('/api/site-config')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch site config');
      return res.json() as Promise<SiteConfig>;
    })
    .then((data) => {
      cache = data;
      fetchPromise = null;
      return data;
    })
    .catch((err) => {
      fetchPromise = null;
      throw err;
    });

  return fetchPromise;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig | null>(cache);
  const [loading, setLoading] = useState<boolean>(cache === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) {
      setConfig(cache);
      setLoading(false);
      return;
    }

    fetchSiteConfig()
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { config, loading, error };
}

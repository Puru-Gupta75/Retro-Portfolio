'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { systemStore } from '@/store/useSystemStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialLinks {
  github: string;
  linkedin: string;
  twitter: string;
  email: string;
}

interface ProfileData {
  displayName: string;
  bio: string;
  role: string;
  status: string;
  location: string;
  website: string;
  socialLinks: SocialLinks;
  resumeUrl: string;
}

const EMPTY_PROFILE: ProfileData = {
  displayName: '',
  bio: '',
  role: '',
  status: '',
  location: '',
  website: '',
  socialLinks: { github: '', linkedin: '', twitter: '', email: '' },
  resumeUrl: '',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[9px] text-amber-900 uppercase tracking-widest font-mono">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-black border border-amber-900/30 p-2 text-amber-500 font-mono text-xs focus:border-amber-500 outline-none transition-colors"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 4,
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
      className="w-full bg-black border border-amber-900/30 p-2 text-amber-500 font-mono text-xs focus:border-amber-500 outline-none resize-none transition-colors"
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfileEditor() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/profile/update');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile({ ...EMPTY_PROFILE, ...data });
    } catch (err) {
      console.error('ProfileEditor: failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const setField = <K extends keyof ProfileData>(key: K, value: ProfileData[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  const setSocialField = (key: keyof SocialLinks, value: string) => {
    setProfile((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: profile }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        systemStore.addLog('[SUCCESS] PROFILE UPDATED: ADMIN', 'ACTION');
        // Refetch from DB to confirm persisted state
        await fetchProfile();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json();
        const errMsg = data.error || 'UPDATE_FAILED';
        setSaveError(errMsg);
        systemStore.addLog(`[ERROR] PROFILE UPDATE FAILED: ${errMsg}`, 'ERROR');
      }
    } catch {
      setSaveError('NETWORK_ERROR');
      systemStore.addLog('[ERROR] PROFILE UPDATE FAILED: NETWORK_ERROR', 'ERROR');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-amber-900 font-mono text-[10px] animate-pulse uppercase tracking-[0.5em]">
        FETCHING PROFILE DATA...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-[10px] font-mono tracking-[0.4em] opacity-30 uppercase">
        ── PROFILE_REGISTRY ──────────────────────────────────
      </h2>

      <div className="border border-amber-900/20 p-6 space-y-6">
        {/* Row 1: displayName + role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <FieldLabel>Display Name</FieldLabel>
            <TextInput
              value={profile.displayName}
              onChange={(v) => setField('displayName', v)}
              placeholder="PURU_GUPTA"
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>Role / Title</FieldLabel>
            <TextInput
              value={profile.role}
              onChange={(v) => setField('role', v)}
              placeholder="FULL_STACK_ENGINEER"
            />
          </div>
        </div>

        {/* Row 2: bio */}
        <div className="space-y-1">
          <FieldLabel>Bio</FieldLabel>
          <TextArea
            value={profile.bio}
            onChange={(v) => setField('bio', v)}
            rows={4}
          />
        </div>

        {/* Row 3: status + location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <FieldLabel>Status</FieldLabel>
            <TextInput
              value={profile.status}
              onChange={(v) => setField('status', v)}
              placeholder="OPEN_TO_WORK"
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>Location</FieldLabel>
            <TextInput
              value={profile.location}
              onChange={(v) => setField('location', v)}
              placeholder="DELHI_IN"
            />
          </div>
        </div>

        {/* Row 4: website + resumeUrl */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <FieldLabel>Website URL</FieldLabel>
            <TextInput
              value={profile.website}
              onChange={(v) => setField('website', v)}
              placeholder="https://yoursite.dev"
              type="url"
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>Resume URL</FieldLabel>
            <TextInput
              value={profile.resumeUrl}
              onChange={(v) => setField('resumeUrl', v)}
              placeholder="/resume.pdf or https://..."
            />
          </div>
        </div>

        {/* Row 5: socialLinks */}
        <div className="space-y-2">
          <FieldLabel>Social Links</FieldLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 border-l border-amber-900/20">
            {(['github', 'linkedin', 'twitter', 'email'] as const).map((platform) => (
              <div key={platform} className="space-y-1">
                <FieldLabel>{platform}</FieldLabel>
                <TextInput
                  value={profile.socialLinks[platform]}
                  onChange={(v) => setSocialField(platform, v)}
                  placeholder={
                    platform === 'email'
                      ? 'you@domain.com'
                      : `https://${platform}.com/username`
                  }
                  type={platform === 'email' ? 'email' : 'url'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Status messages */}
        {saveError && (
          <p className="text-[9px] text-red-500 uppercase tracking-widest font-mono animate-pulse">
            !! ERROR: {saveError} !!
          </p>
        )}
        {saveSuccess && (
          <p className="text-[9px] text-green-500 uppercase tracking-widest font-mono">
            ✓ PROFILE COMMITTED
          </p>
        )}

        {/* Submit */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-amber-600 text-black font-mono font-bold text-xs p-3 tracking-[0.4em] uppercase hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'COMMITTING...' : '[ COMMIT_PROFILE ]'}
        </button>
      </div>
    </div>
  );
}

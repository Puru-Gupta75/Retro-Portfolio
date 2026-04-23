import { z } from 'zod';

// ─── PROJECT SCHEMA ───────────────────────────────────────────────────────────
/**
 * Full project document schema.
 * Manual fields are protected from sync overwrites.
 * GitHub fields are protected from admin overwrites.
 */
export const ProjectSchema = z.object({
  // ── GitHub-sourced fields (sync writes, admin cannot modify) ──
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().default(null),
  url: z.string().url(),
  stars: z.number().default(0),
  forks: z.number().default(0),
  watchers: z.number().default(0),
  language: z.string().nullable().default(null as string | null),
  languages: z.record(z.string(), z.number()).default({}),  // { TypeScript: 80, CSS: 20 }
  topics: z.array(z.string()).default([]),
  lastUpdated: z.string(),                       // ISO string
  priorityScore: z.number().default(0),          // Calculated from GitHub data

  // ── Manual fields (admin-only writes, sync CANNOT touch) ──
  displayName: z.string().default(''),
  customDesc: z.string().default(''),
  tags: z.array(z.string()).default([]),
  category: z.string().default(''),
  isFeatured: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  repoUrl: z.string().default(''),
  websiteUrl: z.string().default(''),
  showRepoLink: z.boolean().default(true),
  showWebsiteLink: z.boolean().default(false),
  techStack: z.object({
    frontend: z.array(z.string()).default([]),
    backend: z.array(z.string()).default([]),
    database: z.array(z.string()).default([]),
    other: z.array(z.string()).default([]),
  }).default({ frontend: [], backend: [], database: [], other: [] }),
  features: z.array(z.string()).default([]),
  systemFlow: z.string().default(''),
  sortOrder: z.number().default(0),

  // ── System fields ──
  isArchived: z.boolean().default(false),
  syncStatus: z.enum(['IDLE', 'SYNCING', 'ERROR']).default('IDLE'),
  lastSyncAt: z.number().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// ─── PROFILE SCHEMA ───────────────────────────────────────────────────────────
/**
 * User profile document schema.
 * All fields are manual — admin is the sole writer.
 * Stored in Firestore at: profile/main
 */
export const ProfileSchema = z.object({
  // ── Manual fields (admin-only writes) ──
  displayName: z.string().default(''),
  bio: z.string().default(''),
  role: z.string().default(''),
  status: z.string().default(''),
  location: z.string().default(''),
  website: z.string().default(''),
  socialLinks: z.object({
    github: z.string().default(''),
    linkedin: z.string().default(''),
    twitter: z.string().default(''),
    email: z.string().default(''),
  }).default({ github: '', linkedin: '', twitter: '', email: '' }),
  resumeUrl: z.string().default(''),

  // ── System fields ──
  lastModifiedAt: z.number().optional(),
  modifiedBy: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ─── ACTIVITY SCHEMA ──────────────────────────────────────────────────────────
/**
 * Ensures idempotent activity tracking via activityId.
 */
export const ActivitySchema = z.object({
  id: z.string(),                // activityId (GitHub event ID — ensures idempotency)
  projectId: z.string(),
  type: z.enum(['COMMIT', 'PR_OPEN', 'PR_MERGE', 'ISSUE_OPEN', 'RELEASE']),
  message: z.string(),
  url: z.string().url(),
  timestamp: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;

// ─── LOG SCHEMA ───────────────────────────────────────────────────────────────
export const LogSchema = z.object({
  id: z.string(),
  type: z.enum(['INFO', 'ACTION', 'WARNING', 'ERROR']),
  message: z.string(),
  timestamp: z.number(),
  context: z.string().optional(),
  component: z.string().optional(),
});

export type SystemLog = z.infer<typeof LogSchema>;

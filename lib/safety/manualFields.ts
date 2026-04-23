/**
 * MANUAL FIELD REGISTRY
 * Single source of truth for field ownership classification.
 * HIERARCHY: MANUAL (ADMIN) > SYSTEM > GITHUB
 *
 * Any field listed here:
 *   - CANNOT be written by the sync engine
 *   - CAN ONLY be written by the admin panel via authenticated API routes
 *   - MUST be editable in the admin panel (HARD RULE)
 */

// ─── PROJECT MANUAL FIELDS ────────────────────────────────────────────────────
export const PROJECT_MANUAL_FIELDS = [
  'displayName',   // Custom project title
  'customDesc',    // Custom highlight / description
  'tags',          // Array of custom tags
  'category',      // Project category (FULLSTACK | AI | DATA | SYSTEM | etc.)
  'isFeatured',    // Featured flag
  'isHidden',      // Hidden flag
  'isVisible',     // Visibility toggle — controls whether project appears in public view
  'repoUrl',       // Override / custom repository URL
  'websiteUrl',    // Live demo / website URL
  'showRepoLink',  // Whether to show the View Source Code button
  'showWebsiteLink', // Whether to show the Live Demo button
  'techStack',     // { frontend, backend, database, other } — admin-curated
  'features',      // Array of feature strings
  'systemFlow',    // "USER -> UI -> API -> DB" — admin-curated
  'sortOrder',     // Manual sort override (lower = higher priority)
] as const;

export type ProjectManualField = typeof PROJECT_MANUAL_FIELDS[number];

// ─── PROFILE MANUAL FIELDS ────────────────────────────────────────────────────
export const PROFILE_MANUAL_FIELDS = [
  'displayName',   // Public display name
  'bio',           // Short biography
  'role',          // Current role / title
  'status',        // Availability status (e.g. OPEN_TO_WORK, EMPLOYED)
  'location',      // Location string
  'website',       // Personal website URL
  'socialLinks',   // { github, linkedin, twitter, etc. }
  'resumeUrl',     // URL to resume PDF
] as const;

export type ProfileManualField = typeof PROFILE_MANUAL_FIELDS[number];

// ─── GITHUB-ONLY FIELDS (sync writes, admin cannot modify) ────────────────────
export const PROJECT_GITHUB_FIELDS = [
  'id',
  'name',
  'description',
  'url',
  'stars',
  'forks',
  'watchers',
  'language',
  'languages',
  'topics',
  'lastUpdated',
  'priorityScore',  // Calculated from GitHub data — sync-owned
] as const;

export type ProjectGithubField = typeof PROJECT_GITHUB_FIELDS[number];

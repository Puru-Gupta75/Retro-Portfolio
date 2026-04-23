import { ProjectSchema, ProfileSchema } from './validation';
import {
  PROJECT_MANUAL_FIELDS,
  PROFILE_MANUAL_FIELDS,
  PROJECT_GITHUB_FIELDS,
  type ProjectManualField,
  type ProfileManualField,
} from './manualFields';

/**
 * writeGuard
 * Enforces the ownership hierarchy: MANUAL (ADMIN) > SYSTEM > GITHUB
 *
 * Two protection directions:
 *   1. filterSyncPayload  — strips ALL manual fields before sync writes
 *   2. filterAdminPayload — strips ALL non-manual fields before admin writes
 *
 * This means neither side can accidentally cross the ownership boundary.
 */
export const writeGuard = {
  // ─── SYNC ENGINE PROTECTION ─────────────────────────────────────────────────

  /**
   * Filter payload for the Sync Engine.
   * Hard-deletes every manual field so sync NEVER touches admin-owned data.
   * Called before EVERY Firestore write in the sync pipeline.
   */
  filterSyncPayload(payload: Record<string, any>): Record<string, any> {
    const safePayload = { ...payload };

    // Hard-delete every manual field — no exceptions
    for (const field of PROJECT_MANUAL_FIELDS) {
      delete safePayload[field];
    }

    return safePayload;
  },

  // ─── ADMIN WRITE PROTECTION ──────────────────────────────────────────────────

  /**
   * Filter payload for Admin Project Writes.
   * Whitelist-only: only manual project fields pass through.
   * GitHub fields are silently dropped — admin cannot overwrite them.
   */
  filterAdminProjectPayload(payload: Record<string, any>): Record<string, any> {
    const safePayload: Record<string, any> = {};

    for (const field of PROJECT_MANUAL_FIELDS) {
      if (payload[field] !== undefined) {
        safePayload[field as string] = payload[field];
      }
    }

    return safePayload;
  },

  /**
   * Filter payload for Admin Profile Writes.
   * Whitelist-only: only manual profile fields pass through.
   */
  filterAdminProfilePayload(payload: Record<string, any>): Record<string, any> {
    const safePayload: Record<string, any> = {};

    for (const field of PROFILE_MANUAL_FIELDS) {
      if (payload[field] !== undefined) {
        safePayload[field as string] = payload[field];
      }
    }

    return safePayload;
  },

  // ─── SCHEMA VALIDATION ───────────────────────────────────────────────────────

  /**
   * Validates a project object against the full schema before any write.
   * Strips unknown fields and applies defaults.
   * NOTE: Only call this on new document creation — not on partial updates.
   */
  validateNewProject(data: Record<string, any>): Record<string, any> {
    // Strip FieldValue sentinels (serverTimestamp etc.) before Zod validation
    const strippable = ['createdAt', 'lastSyncedAt', 'lastModifiedAt'];
    const stripped: Record<string, any> = { ...data };
    for (const key of strippable) {
      delete stripped[key];
    }

    const parsed = ProjectSchema.parse(stripped);
    return parsed;
  },

  /**
   * Validates a profile object against the full schema before any write.
   */
  validateProfile(data: Record<string, any>): Record<string, any> {
    const parsed = ProfileSchema.parse(data);
    return parsed;
  },

  // ─── AUDIT HELPERS ───────────────────────────────────────────────────────────

  /**
   * Returns the list of manual project fields for audit/logging purposes.
   */
  getProjectManualFields(): readonly string[] {
    return PROJECT_MANUAL_FIELDS;
  },

  /**
   * Returns the list of manual profile fields for audit/logging purposes.
   */
  getProfileManualFields(): readonly string[] {
    return PROFILE_MANUAL_FIELDS;
  },

  /**
   * Checks whether a given field is manual (admin-owned).
   * Used for runtime assertions and logging.
   */
  isManualProjectField(field: string): field is ProjectManualField {
    return (PROJECT_MANUAL_FIELDS as readonly string[]).includes(field);
  },

  isManualProfileField(field: string): field is ProfileManualField {
    return (PROFILE_MANUAL_FIELDS as readonly string[]).includes(field);
  },
};

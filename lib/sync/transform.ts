import { GitHubRepo } from './fetch';
import { calculatePriorityScore } from './scoring';

export interface ProjectData {
  // Fields aligned with ProjectSchema in lib/safety/validation.ts
  id: string;          // repo id (string)
  name: string;        // repo slug / name
  description: string | null;
  url: string;         // html_url
  stars: number;
  forks: number;
  language: string | null;
  lastUpdated: string; // ISO string — max(pushed_at, latestCommitDate)

  // Extra GitHub fields stored alongside but not required by schema
  topics: string[];
  priorityScore: number;
}

/**
 * Normalizes GitHub repository data into our internal project schema.
 */
export function transformRepo(
  repo: GitHubRepo,
  latestCommitDate: string | null,
  isFeatured = false
): ProjectData {
  const pushedAt = new Date(repo.pushed_at);
  const commitDate = latestCommitDate ? new Date(latestCommitDate) : null;

  // lastActivityAt = max(pushed_at, latestCommitTimestamp)
  const lastActivityAt = commitDate && commitDate > pushedAt ? commitDate : pushedAt;

  const score = calculatePriorityScore({
    stars: repo.stargazers_count,
    lastActivityAt,
    isFeatured,
  });

  return {
    id: repo.id.toString(),
    name: repo.name,
    description: repo.description || null,
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language || null,
    lastUpdated: lastActivityAt.toISOString(),
    topics: repo.topics || [],
    priorityScore: score,
  };
}

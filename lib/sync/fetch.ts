import { octokit } from '@/utils/github';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  pushed_at: string;
  updated_at: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

/**
 * Fetches all repositories for the authenticated user.
 */
export async function fetchUserRepos(): Promise<GitHubRepo[]> {
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: 'pushed',
    direction: 'desc',
    per_page: 100,
  });
  return data as GitHubRepo[];
}

/**
 * Fetches the latest commit for a specific repository.
 */
export async function fetchLatestCommit(owner: string, repo: string) {
  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 1,
    });
    return data[0];
  } catch (error) {
    console.error(`Failed to fetch commits for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Fetches recent events for a specific repository.
 */
export async function fetchRepoEvents(owner: string, repo: string) {
  try {
    const { data } = await octokit.activity.listRepoEvents({
      owner,
      repo,
      per_page: 10,
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch events for ${owner}/${repo}:`, error);
    return [];
  }
}

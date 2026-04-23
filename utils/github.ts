import { Octokit } from '@octokit/rest';

if (!process.env.GITHUB_TOKEN) {
  throw new Error('Missing GITHUB_TOKEN environment variable');
}

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Checks remaining GitHub API rate limit.
 * Returns true if we have enough budget to proceed.
 */
export async function hasApiBudget(minRemaining = 100): Promise<boolean> {
  try {
    const { data } = await octokit.rateLimit.get();
    return data.resources.core.remaining > minRemaining;
  } catch (error) {
    console.error('Failed to check rate limit:', error);
    return false;
  }
}

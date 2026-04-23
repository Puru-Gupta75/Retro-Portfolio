import { ActivitySchema } from '@/lib/safety/validation';

type EventType = 'COMMIT' | 'PR_OPEN' | 'PR_MERGE' | 'ISSUE_OPEN' | 'RELEASE';

/**
 * Maps a raw GitHub event type string to our internal ActivitySchema type.
 * Returns null for event types we don't track.
 */
function mapEventType(githubType: string, payload: any): EventType | null {
  switch (githubType) {
    case 'PushEvent':
      return 'COMMIT';
    case 'PullRequestEvent':
      if (payload?.action === 'closed' && payload?.pull_request?.merged) return 'PR_MERGE';
      if (payload?.action === 'opened') return 'PR_OPEN';
      return null;
    case 'IssuesEvent':
      if (payload?.action === 'opened') return 'ISSUE_OPEN';
      return null;
    case 'ReleaseEvent':
      return 'RELEASE';
    default:
      return null;
  }
}

/**
 * Extracts a human-readable message from a raw GitHub event.
 */
function extractMessage(githubType: string, payload: any, repoName: string): string {
  switch (githubType) {
    case 'PushEvent': {
      const commit = payload?.commits?.[0];
      return commit?.message?.split('\n')[0] || `Push to ${repoName}`;
    }
    case 'PullRequestEvent':
      return payload?.pull_request?.title || `PR on ${repoName}`;
    case 'IssuesEvent':
      return payload?.issue?.title || `Issue on ${repoName}`;
    case 'ReleaseEvent':
      return payload?.release?.name || payload?.release?.tag_name || `Release on ${repoName}`;
    default:
      return `Activity on ${repoName}`;
  }
}

/**
 * Extracts a URL from a raw GitHub event.
 */
function extractUrl(githubType: string, payload: any, repoHtmlUrl: string): string {
  switch (githubType) {
    case 'PushEvent': {
      const commit = payload?.commits?.[0];
      return commit?.url
        ? commit.url.replace('api.github.com/repos', 'github.com').replace('/commits/', '/commit/')
        : repoHtmlUrl;
    }
    case 'PullRequestEvent':
      return payload?.pull_request?.html_url || repoHtmlUrl;
    case 'IssuesEvent':
      return payload?.issue?.html_url || repoHtmlUrl;
    case 'ReleaseEvent':
      return payload?.release?.html_url || repoHtmlUrl;
    default:
      return repoHtmlUrl;
  }
}

/**
 * Transforms a raw GitHub event into a validated ActivitySchema object.
 * Returns null if the event type is not tracked or data is insufficient.
 */
export function transformEvent(
  event: any,
  projectId: string,
  repoHtmlUrl: string
): ReturnType<typeof ActivitySchema.parse> | null {
  // GitHub event IDs are strings — guard against null/undefined
  const rawId = event?.id;
  if (!rawId) return null;

  const activityId = String(rawId);
  const type = mapEventType(event.type, event.payload);
  if (!type) return null;

  const repoName = event?.repo?.name || projectId;
  const message = extractMessage(event.type, event.payload, repoName);
  const url = extractUrl(event.type, event.payload, repoHtmlUrl);
  const timestamp = event.created_at ? new Date(event.created_at).getTime() : Date.now();

  const parsed = ActivitySchema.safeParse({
    id: activityId,
    projectId,
    type,
    message,
    url,
    timestamp,
  });

  if (!parsed.success) return null;
  return parsed.data;
}

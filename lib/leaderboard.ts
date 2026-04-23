// Leaderboard system — Firestore-backed via API routes
export interface Score {
  name: string;
  score: number;
  timestamp: number;
}

const MAX_SCORES = 10;

/**
 * Fetch top scores for a game from Firestore (via API).
 */
export async function getLeaderboard(game: string): Promise<Score[]> {
  try {
    const res = await fetch(`/api/leaderboard?game=${encodeURIComponent(game)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.scores ?? [];
  } catch {
    return [];
  }
}

/**
 * Save a score to Firestore (via API).
 * Returns true on success.
 */
export async function saveScore(game: string, name: string, score: number): Promise<boolean> {
  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, name, score }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Check if a score qualifies for the top 10 by fetching current board.
 */
export async function isHighScore(game: string, score: number): Promise<boolean> {
  const scores = await getLeaderboard(game);
  if (scores.length < MAX_SCORES) return true;
  return score > scores[scores.length - 1].score;
}

/**
 * Format leaderboard as a terminal-style string.
 */
export function formatLeaderboard(game: string, scores: Score[]): string {
  if (scores.length === 0) {
    return `> LEADERBOARD — ${game.toUpperCase()}\n\n  No scores yet. Be the first!`;
  }

  const lines = scores.map((s, i) => {
    const rank = (i + 1).toString().padStart(2, ' ');
    const name = s.name.padEnd(15, ' ');
    const score = s.score.toString().padStart(6, ' ');
    return `  ${rank}. ${name} — ${score}`;
  });

  return `> LEADERBOARD — ${game.toUpperCase()}\n\n${lines.join('\n')}`;
}

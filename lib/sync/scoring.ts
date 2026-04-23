/**
 * Calculates a project's priority score for sorting and fetch prioritization.
 * Implements bounded recency decay to ensure stability over time.
 */
export function calculatePriorityScore(params: {
  stars: number;
  lastActivityAt: Date;
  isFeatured: boolean;
}): number {
  const { stars, lastActivityAt, isFeatured } = params;

  // Calculate days since active
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActivityAt.getTime());
  const daysSinceActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Recency Factor: max -50 penalty, -0.5 per day
  const recencyFactor = Math.max(-50, daysSinceActive * -0.5);

  // Featured Boost: +50
  const featuredBoost = isFeatured ? 50 : 0;

  // Final Formula: (stars * 1.5) + recency + boost
  // Clamped at 0 to avoid negative ordering anomalies
  const score = (stars * 1.5) + recencyFactor + featuredBoost;

  return Math.max(0, score);
}

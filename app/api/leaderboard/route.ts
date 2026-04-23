import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/firestore';
import { FieldValue } from 'firebase-admin/firestore';

const MAX_SCORES = 10;
const VALID_GAMES = ['snake', 'pong', 'runner', 'memory'];

/**
 * GET /api/leaderboard?game=snake
 * Returns top scores for a game, ordered by score descending.
 */
export async function GET(req: NextRequest) {
  const game = req.nextUrl.searchParams.get('game')?.toLowerCase();

  if (!game || !VALID_GAMES.includes(game)) {
    return NextResponse.json({ error: 'Invalid game' }, { status: 400 });
  }

  try {
    const snap = await db
      .collection('leaderboards')
      .doc(game)
      .collection('scores')
      .orderBy('score', 'desc')
      .limit(MAX_SCORES)
      .get();

    const scores = snap.docs.map(doc => {
      const d = doc.data();
      return {
        name: d.name as string,
        score: d.score as number,
        timestamp: d.timestamp?.toMillis?.() ?? Date.now(),
      };
    });

    return NextResponse.json({ game, scores });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch scores', message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/leaderboard
 * Body: { game, name, score }
 * Saves a score and returns whether it made the top 10.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { game, name, score } = body;

    if (!game || !VALID_GAMES.includes(game?.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid game' }, { status: 400 });
    }
    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
    }
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    // Sanitize name: strip non-printable/non-ASCII and HTML-unsafe chars, cap length
    const safeName = name
      .replace(/[^\x20-\x7E]/g, '')   // printable ASCII only
      .replace(/[<>"'&]/g, '')         // strip HTML special chars
      .substring(0, 20)
      .trim() || 'ANON';

    // Cap score to prevent absurd values
    const safeScore = Math.min(score, 9_999_999);
    const gameKey = game.toLowerCase();

    // Add the score
    await db
      .collection('leaderboards')
      .doc(gameKey)
      .collection('scores')
      .add({
        name: safeName,
        score: safeScore,
        timestamp: FieldValue.serverTimestamp(),
      });

    // Check if it's a high score (top 10)
    const snap = await db
      .collection('leaderboards')
      .doc(gameKey)
      .collection('scores')
      .orderBy('score', 'desc')
      .limit(MAX_SCORES)
      .get();

    const topScores = snap.docs.map(d => d.data().score as number);
    const isHighScore = topScores.includes(safeScore);

    return NextResponse.json({ success: true, isHighScore });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save score', message: error.message }, { status: 500 });
  }
}

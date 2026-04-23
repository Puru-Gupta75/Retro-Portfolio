'use client';

import { useEffect, useState } from 'react';
import { saveScore, isHighScore } from '@/lib/leaderboard';

interface GameOverScreenProps {
  game: string;
  score: number;
  playerName: string;
  onRestart: () => void;
  onExit: () => void;
}

export default function GameOverScreen({
  game,
  score,
  playerName,
  onRestart,
  onExit
}: GameOverScreenProps) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isHigh, setIsHigh] = useState(false);

  useEffect(() => {
    isHighScore(game, score).then(setIsHigh);
  }, [game, score]);

  const handleSave = async () => {
    setSaving(true);
    const success = await saveScore(game, playerName, score);
    if (success) setSaved(true);
    setSaving(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono p-4">
      <div className="border border-green-500 p-8 max-w-md w-full text-center">
        <h2 className="text-3xl mb-4 text-red-500">GAME OVER</h2>

        <div className="mb-6">
          <p className="text-sm opacity-70 mb-2">PLAYER: {playerName}</p>
          <p className="text-2xl mb-2">SCORE: {score}</p>
          {isHigh && !saved && (
            <p className="text-yellow-500 text-sm animate-pulse">★ HIGH SCORE! ★</p>
          )}
        </div>

        {!saved ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full border border-green-500 p-2 mb-2 hover:bg-green-500 hover:text-black transition-colors disabled:opacity-50"
          >
            {saving ? 'SAVING...' : 'SAVE SCORE'}
          </button>
        ) : (
          <div className="border border-green-500 p-2 mb-2 bg-green-900/20">
            ✓ SCORE SAVED
          </div>
        )}

        <button
          onClick={onRestart}
          className="w-full border border-green-500 p-2 mb-2 hover:bg-green-500 hover:text-black transition-colors"
        >
          PLAY AGAIN
        </button>

        <button
          onClick={onExit}
          className="w-full border border-green-500 p-2 hover:bg-green-500 hover:text-black transition-colors"
        >
          EXIT TO TERMINAL
        </button>
      </div>
    </div>
  );
}

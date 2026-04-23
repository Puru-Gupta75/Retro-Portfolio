'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, Score } from '@/lib/leaderboard';

interface LeaderboardDisplayProps {
  game: string;
  onClose: () => void;
}

export default function LeaderboardDisplay({ game, onClose }: LeaderboardDisplayProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard(game).then(s => {
      if (!cancelled) {
        setScores(s);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [game]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-300">
      <div className="border border-primary/30 bg-black/90 p-6 md:p-10 max-w-2xl w-full relative overflow-hidden shadow-[0_0_50px_rgba(255,176,0,0.1)]">
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />

        <header className="mb-8 text-center space-y-2">
          <p className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.5em]">Global Database</p>
          <h2 className="text-3xl font-space font-bold tracking-tighter uppercase text-glow">
            LEADERBOARD // {game.replace('_', ' ')}
          </h2>
          <div className="h-px bg-linear-to-r from-transparent via-primary/30 to-transparent w-full" />
        </header>

        <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
          {loading ? (
            <div className="text-center text-primary/40 font-mono py-12 animate-pulse">
              FETCHING_RECORDS...
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center text-primary/40 font-mono py-12 border border-dashed border-primary/10 italic">
              NO_RECORDS_FOUND_IN_BUFFER
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {scores.map((score, i) => (
                <div
                  key={`${score.name}-${score.score}-${score.timestamp}`}
                  className="flex items-center justify-between border border-primary/10 bg-primary/5 p-4 font-mono text-primary group hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold w-10 opacity-40 group-hover:opacity-100 transition-opacity">
                      {(i + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-lg tracking-tight">{score.name}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-bold text-glow">{score.score.toLocaleString()}</span>
                    <span className="text-[10px] opacity-30 font-mono hidden sm:block">
                      {new Date(score.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-primary text-black p-4 font-mono font-bold uppercase hover:bg-glow transition-all phosphor-glow mt-4"
        >
          [ CLOSE_DATABASE_LINK ]
        </button>
      </div>
    </div>
  );
}

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
  const [visibleLines, setVisibleLines] = useState(0);

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

  // Reveal lines one by one after loading
  useEffect(() => {
    if (loading) return;
    setVisibleLines(0);
    const totalLines = scores.length + 6; // header lines + score lines
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= totalLines) clearInterval(interval);
    }, 60);
    return () => clearInterval(interval);
  }, [loading, scores.length]);

  const gameName = game.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-100 p-4">
      <div className="w-full max-w-2xl font-mono text-primary text-sm leading-relaxed">

        {/* Terminal window chrome */}
        <div className="border border-primary/40 bg-black">
          {/* Title bar */}
          <div className="border-b border-primary/20 px-4 py-2 flex items-center gap-2 text-[10px] text-primary/40 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary/30 inline-block" />
            TERMINAL — GLOBAL_DB_ACCESS
          </div>

          {/* Terminal body */}
          <div className="p-4 md:p-6 min-h-[320px]">

            {/* Boot lines */}
            {visibleLines > 0 && (
              <p className="text-primary/50 text-xs">{'>'} CONNECTING TO GLOBAL_DATABASE...</p>
            )}
            {visibleLines > 1 && (
              <p className="text-primary/50 text-xs">{'>'} AUTH_TOKEN: OK</p>
            )}
            {visibleLines > 2 && (
              <p className="text-primary/50 text-xs mb-3">{'>'} QUERY: SELECT * FROM scores WHERE game=&quot;{gameName}&quot; ORDER BY score DESC LIMIT 10</p>
            )}
            {visibleLines > 3 && (
              <p className="text-primary text-xs mb-1 border-b border-primary/20 pb-1 uppercase tracking-widest">
                ── LEADERBOARD // {gameName} ──────────────────────────
              </p>
            )}
            {visibleLines > 4 && (
              <p className="text-primary/40 text-[10px] mb-2 uppercase tracking-widest">
                {'  '}RANK{'  '}NAME{'                    '}SCORE{'       '}DATE
              </p>
            )}

            {loading ? (
              <p className="text-primary/50 text-xs animate-pulse">{'>'} FETCHING_RECORDS<span className="animate-pulse">_</span></p>
            ) : scores.length === 0 ? (
              visibleLines > 5 && (
                <p className="text-primary/40 text-xs mt-4">{'>'} NO_RECORDS_FOUND_IN_BUFFER</p>
              )
            ) : (
              scores.map((score, i) => {
                if (visibleLines < 6 + i) return null;
                const rank = (i + 1).toString().padStart(2, '0');
                const name = score.name.toUpperCase().padEnd(22, ' ');
                const pts = score.score.toLocaleString().padStart(8, ' ');
                const date = new Date(score.timestamp).toLocaleDateString('en-GB').replace(/\//g, '-');
                const isTop = i === 0;
                return (
                  <p
                    key={`${score.name}-${score.score}-${score.timestamp}`}
                    className={`text-xs tracking-wide whitespace-pre ${isTop ? 'text-primary font-bold' : 'text-primary/70'}`}
                  >
                    {'  '}{rank}{'    '}{name}{pts}{'    '}{date}
                  </p>
                );
              })
            )}

            {/* Blinking cursor */}
            <span className="inline-block w-2 h-3 bg-primary/70 animate-pulse mt-3 ml-1" />
          </div>

          {/* Close button */}
          <div className="border-t border-primary/20 p-3">
            <button
              onClick={onClose}
              className="w-full text-center text-xs font-mono uppercase tracking-widest text-black bg-primary py-3 hover:bg-primary/80 transition-colors"
            >
              {'>'} CLOSE_DATABASE_LINK
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

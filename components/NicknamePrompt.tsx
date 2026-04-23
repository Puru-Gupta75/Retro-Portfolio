'use client';

import { useState } from 'react';

interface HandlePromptProps {
  onSubmit: (handle: string) => void;
  onCancel?: () => void;
  gameName?: string;
  score: number;
}

export default function HandlePrompt({ onSubmit, onCancel, gameName = 'ARCADE_SYSTEM', score }: HandlePromptProps) {
  const [handle, setHandle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      onSubmit(handle.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="border border-primary/30 bg-black/90 p-8 md:p-12 max-w-md w-full relative shadow-[0_0_60px_rgba(255,176,0,0.15)]">
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary" />

        <header className="mb-8 text-center space-y-2">
          <p className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.5em]">Score Verified</p>
          <h2 className="text-3xl text-primary font-space font-bold tracking-tighter uppercase text-glow">
            NEW HIGH SCORE
          </h2>
          <div className="text-4xl font-mono font-bold text-primary animate-pulse">{score.toLocaleString()}</div>
        </header>

        <p className="text-[11px] font-mono text-primary/60 mb-8 text-center uppercase tracking-widest leading-relaxed">
          Identity tag required for <span className="text-primary">{gameName.toUpperCase().replace('_', ' ')}</span> database commitment.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-primary/30 uppercase tracking-widest ml-1">SYSTEM_HANDLE</label>
            <div className="flex items-center border border-primary/20 bg-primary/5 p-3 group focus-within:border-primary/60 transition-colors">
              <span className="mr-3 text-primary/40 font-mono tracking-tighter">&gt;_</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toUpperCase())}
                maxLength={20}
                className="flex-1 bg-transparent outline-none text-primary font-mono text-lg placeholder:text-primary/10"
                placeholder="USER_ID"
                autoFocus
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 border border-primary/20 p-3 font-mono text-xs text-primary/60 uppercase hover:bg-primary/5 transition-all"
              >
                Discard
              </button>
            )}
            <button
              type="submit"
              disabled={!handle.trim()}
              className="flex-[2] bg-primary text-black p-3 font-mono font-bold uppercase hover:bg-glow transition-all phosphor-glow disabled:opacity-20 disabled:grayscale"
            >
              Commit Entry
            </button>
          </div>
        </form>
        <div className="mt-8 pt-6 border-t border-primary/5">
          <p className="text-[9px] font-mono opacity-20 text-center uppercase tracking-[0.3em]">
            This packet will be broadcast to global nodes.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { systemStore } from '@/store/useSystemStore';
import { logEvent } from '@/lib/systemLogger';
import { useSystem } from '@/context/SystemContext';
import { useRouter } from 'next/navigation';
import SnakeGame from './games/SnakeGame';
import PongGame from './games/PongGame';
import RunnerGame from './games/RunnerGame';
import MemoryGame from './games/MemoryGame';
import { saveScore, getLeaderboard, formatLeaderboard } from '@/lib/leaderboard';

import { useSync } from '@/context/SyncContext';
import { commandEngine } from '@/lib/command/engine';

type Line = { id: string; text: string; isCmd?: boolean };

// State machine for terminal input modes
type InputMode =
  | { kind: 'command' }
  | { kind: 'await_handle'; game: string }       // waiting for handle before game starts
  | { kind: 'await_score_handle'; game: string; score: number }; // waiting for handle after high score

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

export const CommandTerminal: React.FC = () => {
  const { setPerformanceMode, setIsBooting } = useSystem();
  const router = useRouter();
  const { triggerSync, status, logs } = useSync();
  const [input, setInput] = useState('');
  const [lines, setLines] = useState<Line[]>([
    { id: uid(), text: 'AMBER_OS TERMINAL v1.2' },
    { id: uid(), text: 'Type "help" for available commands.' },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [mode, setMode] = useState<InputMode>({ kind: 'command' });
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [currentHandle, setCurrentHandle] = useState<string>('ANON');


  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const push = useCallback((...texts: string[]) => {
    setLines(prev => [
      ...prev,
      ...texts.map(text => ({ id: uid(), text })),
    ]);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
    }
  }, [lines, currentGame]);

  // Pipe sync logs to terminal
  useEffect(() => {
    if (status === 'SYNCING' && logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      push(`[${lastLog.stage}] ${lastLog.message}`);
    }
  }, [logs, status, push]);

  useEffect(() => {
    if (!currentGame) {
      // Re-focus input after game exits
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentGame]);

  const handleGameOver = useCallback(async (score: number, game: string) => {
    setCurrentGame(null);
    const board = await getLeaderboard(game);
    const isNew = board.length < 10 || score > (board[board.length - 1]?.score ?? 0);

    if (isNew && score > 0) {
      await saveScore(game, currentHandle, score);
      const updatedBoard = await getLeaderboard(game);
      push(
        `> SESSION_END — ${game.toUpperCase()} — SCORE: ${score}`,
        `> ENTRY COMMITTED FOR HANDLE: ${currentHandle}`,
        ``,
        ...formatLeaderboard(game, updatedBoard).split('\n'),
        ``,
        `> Type "play ${game}" to run again.`,
      );
    } else {
      push(
        `> SESSION_END — ${game.toUpperCase()} — SCORE: ${score}`,
        `> Type "scores ${game}" to view the leaderboard.`,
      );
    }
  }, [currentHandle, push]);

  const handleCommand = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // ── Handle awaiting modes (Kept for game flow) ───────────────────────────
    if (mode.kind === 'await_handle') {
      const handle = trimmed.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20) || 'ANON';
      setCurrentHandle(handle);
      setMode({ kind: 'command' });
      push(
        `> ${trimmed}`,
        `> HANDLE CONFIRMED: ${handle}`,
        `> LAUNCHING ${mode.game.toUpperCase()}...`,
      );
      setTimeout(() => setCurrentGame(mode.game), 200);
      return;
    }

    if (mode.kind === 'await_score_handle') {
      const handle = trimmed.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20) || 'ANON';
      await saveScore(mode.game, handle, mode.score);
      setCurrentHandle(handle);
      setMode({ kind: 'command' });
      const board = await getLeaderboard(mode.game);
      push(
        `> ${trimmed}`,
        `> HANDLE COMMITTED: ${handle}`,
        ``,
        ...formatLeaderboard(mode.game, board).split('\n'),
        ``,
      );
      return;
    }

    // ── Central Command Engine Processing ───────────────────────────────────
    setLines(prev => [...prev, { id: uid(), text: `> ${trimmed}`, isCmd: true }]);
    setHistory(h => [trimmed, ...h].slice(0, 20));
    setHistIdx(-1);

    const context = {
      isAdmin: systemStore.getState().adminAuthenticated,
      systemMode: systemStore.getState().systemMode,
      pathname: window.location.pathname
    };

    const result = await commandEngine.process(trimmed, context);

    // ── Standardized Output Rendering ──────────────────────────────────────
    result.outputs.forEach(out => {
      push(out.text);
    });

    // ── Action Handling ───────────────────────────────────────────────────
    if (result.action === 'navigate' && result.data) {
      if (result.data === '/admin') systemStore.setAdminModuleActive(true);
      router.push(result.data);
    } else if (result.action === 'clear') {
      systemStore.clearLogs();
      setLines([{ id: uid(), text: 'TERMINAL CLEARED.' }]);
    } else if (result.action === 'game' && result.data) {
      push(
        `> TARGET: ${result.data.toUpperCase()}`,
        `> ENTER SYSTEM_HANDLE (max 20 chars, alphanumeric):`,
      );
      setMode({ kind: 'await_handle', game: result.data });
    } else if (result.action === 'leaderboard' && result.data) {
      push(`[DB] FETCHING_SCORES — ${result.data.toUpperCase()}...`);
      const board = await getLeaderboard(result.data);
      push(...formatLeaderboard(result.data, board).split('\n'));
    } else if (result.action === 'terminal_reset') {
      triggerSync();
    }
    
  }, [mode, push, router, triggerSync]);

  const onKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = input.trim();
      setInput('');
      if (val) handleCommand(val);
      return;
    }
    if (mode.kind !== 'command') return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? '');
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : history[next]);
    }
  }, [input, history, histIdx, handleCommand, mode]);

  const inputPlaceholder =
    mode.kind === 'await_handle' ? 'ENTER HANDLE...' :
      mode.kind === 'await_score_handle' ? 'ENTER HANDLE TO SAVE SCORE...' :
        'ENTER COMMAND...';

  const promptPrefix =
    mode.kind === 'await_handle' || mode.kind === 'await_score_handle' ? 'HANDLE>' : '>_';

  // ── Game view ────────────────────────────────────────────────────────────
  if (currentGame) {
    const sharedProps = {
      onExit: () => {
        push(`> ${currentGame.toUpperCase()} EXITED.`);
        setCurrentGame(null);
      },
      contained: true as const,
      theme: 'amber' as const,
    };

    return (
      <div className="border border-primary/10 bg-black w-full overflow-hidden" style={{ minHeight: 380 }}>
        <div className="border-b border-primary/10 px-3 py-2 flex justify-between items-center">
          <span className="font-mono text-[9px] text-primary/30 uppercase tracking-[0.3em]">
            {currentGame.toUpperCase()}_SESSION · HANDLE: {currentHandle}
          </span>
          <button
            onClick={sharedProps.onExit}
            className="font-mono text-[9px] text-primary/20 hover:text-primary uppercase tracking-widest transition-colors"
          >
            [ ESC / EXIT ]
          </button>
        </div>
        <div className="flex items-center justify-center w-full p-3" style={{ minHeight: 340 }}>
          {currentGame === 'snake' && (
            <SnakeGame {...sharedProps} onGameOver={(s) => handleGameOver(s, 'snake')} />
          )}
          {currentGame === 'pong' && (
            <PongGame {...sharedProps} onGameOver={(s) => handleGameOver(s, 'pong')} />
          )}
          {currentGame === 'runner' && (
            <RunnerGame {...sharedProps} onGameOver={(s) => handleGameOver(s, 'runner')} />
          )}
          {currentGame === 'memory' && (
            <MemoryGame {...sharedProps} onGameOver={(s) => handleGameOver(s, 'memory')} />
          )}
        </div>
      </div>
    );
  }

  // ── Terminal view ────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; COMMAND_TERMINAL
      </h3>

      <div
        ref={bottomRef}
        className="bg-primary/5 border border-primary/10 h-52 overflow-y-auto p-3 space-y-px cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`font-mono text-[10px] leading-relaxed whitespace-pre-wrap ${line.isCmd ? 'text-primary' : 'text-primary/50'
              }`}
          >
            {line.text}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-2">
        <span className="font-mono text-[10px] text-primary/40 select-none shrink-0">
          {promptPrefix}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(
            mode.kind !== 'command'
              ? e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 20)
              : e.target.value
          )}
          onKeyDown={onKeyDown}
          className="flex-1 bg-transparent font-mono text-[11px] text-primary outline-none placeholder:opacity-20 uppercase"
          placeholder={inputPlaceholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
        <span className="font-mono text-[11px] text-primary animate-blink shrink-0">█</span>
      </div>

      {mode.kind !== 'command' && (
        <p className="text-[9px] font-mono text-primary/30 uppercase tracking-widest">
          ↳ Awaiting handle — alphanumeric only, max 12 chars
        </p>
      )}
      {mode.kind === 'command' && (
        <p className="text-[9px] font-mono opacity-20 uppercase tracking-widest">
          ↑↓ HISTORY · ENTER TO EXECUTE
        </p>
      )}
    </div>
  );
};

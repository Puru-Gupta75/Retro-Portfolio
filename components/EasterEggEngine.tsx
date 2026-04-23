'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { commandEngine } from '@/lib/command/engine';
import { formatLeaderboard, getLeaderboard } from '@/lib/leaderboard';
import { logEvent } from '@/lib/systemLogger';
import { systemStore } from '@/store/useSystemStore';

export default function EasterEggEngine() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGlitch, setShowGlitch] = useState(false);
  const [showHiddenPort, setShowHiddenPort] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const router = useRouter();

  // Random glitch text
  const triggerGlitch = useCallback(() => {
    if (Math.random() < 0.15) {
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 2000);
    }
  }, []);

  // Idle detection for hidden port
  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        if (!showHiddenPort && Math.random() < 0.7) {
          setShowHiddenPort(true);
          setOutput(prev => [...prev, '> hidden_port_detected', '> Type "hidden_port" to access']);
          logEvent('EASTER_EGG → HIDDEN_PORT_REVEALED', 'INFO');
        }
      }, 8000);
    };

    resetIdleTimer();
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keypress', resetIdleTimer);

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keypress', resetIdleTimer);
    };
  }, [showHiddenPort]);

  // Random glitch trigger
  useEffect(() => {
    const interval = setInterval(triggerGlitch, 10000);
    return () => clearInterval(interval);
  }, [triggerGlitch]);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCommand = useCallback(async (cmd: string) => {
    if (!cmd.trim()) return;

    logEvent(`COMMAND → ${cmd}`, 'ACTION');
    setOutput(prev => [...prev, `> ${cmd}`]);
    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    const ctx = {
      isAdmin: systemStore.getState().adminAuthenticated,
      systemMode: systemStore.getState().systemMode,
      pathname: window.location.pathname,
    };

    const result = await commandEngine.process(cmd, ctx);

    result.outputs.forEach(out => {
      setOutput(prev => [...prev, out.text]);
    });

    if (result.action === 'navigate' && result.data) {
      setTimeout(() => router.push(result.data), 500);
    } else if (result.action === 'clear') {
      setOutput([]);
    } else if (result.action === 'leaderboard' && result.data) {
      const game = result.data;
      getLeaderboard(game).then(scores => {
        const board = formatLeaderboard(game, scores);
        setOutput(prev => [...prev, board]);
      });
    } else if (result.action === 'secret') {
      logEvent(`SECRET_COMMAND → ${result.data}`, 'ACTION');
    }

    setInput('');
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete
      const commands = ['help', 'home', 'play', 'leaderboard', 'fix', 'clear'];
      const match = commands.find(c => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Glitch overlay */}
      {showGlitch && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="text-red-500 opacity-50 animate-pulse font-mono text-sm">
            ... corrupted_signal ...
          </div>
        </div>
      )}

      {/* Terminal output */}
      <div
        ref={outputRef}
        className="bg-black border border-green-500 p-4 h-64 overflow-y-auto font-mono text-sm text-green-500 mb-2"
      >
        {output.map((line, i) => (
          <div key={`${i}-${line.slice(0, 20)}`} className="whitespace-pre-wrap">
            {line}
          </div>
        ))}
        {output.length === 0 && (
          <div className="opacity-50">
            Type &apos;help&apos; for available commands...
          </div>
        )}
      </div>

      {/* Terminal input */}
      <div className="flex items-center bg-black border border-green-500 p-2 font-mono text-sm">
        <span className="text-green-500 mr-2">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-green-500 outline-none"
          placeholder="enter command..."
          autoFocus
        />
      </div>

      <div className="text-xs text-green-500 opacity-50 mt-2 font-mono">
        TIP: Use ↑/↓ for history | TAB for autocomplete
      </div>
    </div>
  );
}

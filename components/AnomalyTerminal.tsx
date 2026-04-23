'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { systemStore } from '@/store/useSystemStore';
import { sounds } from '@/lib/soundEngine';
import { logEvent } from '@/lib/systemLogger';
import SnakeGame from './games/SnakeGame';
import PongGame from './games/PongGame';
import RunnerGame from './games/RunnerGame';
import MemoryGame from './games/MemoryGame';
import LeaderboardDisplay from './LeaderboardDisplay';
import { saveScore } from '@/lib/leaderboard';
import { commandEngine } from '@/lib/command/engine';

type GameType = 'snake' | 'pong' | 'runner' | 'memory' | null;

const GameContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black border border-red-500/10 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
    {/* Subtle Scanlines in game container */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%]" />
    
    {/* Corner Decors */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-red-500/30" />
    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-red-500/30" />
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-red-500/30" />
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-red-500/30" />
    
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
      {children}
    </div>
  </div>
);

export default function AnomalyTerminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([
    '> SYSTEM ANOMALY DETECTED',
    '> Route not found. Terminal access granted.',
    '> Type "help" for available commands',
    '> WARNING: System integrity compromised',
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isRecovering, setIsRecovering] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameType>(null);
  const [awaitingNicknameForGame, setAwaitingNicknameForGame] = useState<GameType>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<string | null>(null);
  const [showGlitch, setShowGlitch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Lock body scroll when playing a game
  useEffect(() => {
    if (currentGame) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [currentGame]);

  // Random system noise
  useEffect(() => {
    const noiseMessages = [
      '... CRITICAL SYSTEM FAILURE ...',
      '... MEMORY CORRUPTION DETECTED ...',
      '... CORE MODULES OFFLINE ...',
      '... EMERGENCY PROTOCOLS ACTIVE ...',
      '... SYSTEM INTEGRITY COMPROMISED ...',
    ];
    
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        const message = noiseMessages[Math.floor(Math.random() * noiseMessages.length)];
        setOutput(prev => [...prev, message]);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleGameOver = useCallback((score: number, game: GameType) => {
    setCurrentGame(null);
    const playerName = systemStore.getState().playerName || 'ANON';
    if (score > 0 && game) {
      saveScore(game, playerName, score);
    }
    setOutput(prev => [...prev, `> GAME OVER → SCORE: ${score}`, '> Returning to terminal...']);
    logEvent(`GAME_OVER → SCORE: ${score}`, 'INFO');
  }, []);

  const handleGameExit = useCallback(() => {
    setCurrentGame(null);
    setOutput(prev => [...prev, '> Game exited', '> Returning to terminal...']);
  }, []);

  const handleCommand = async (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (awaitingNicknameForGame) {
      const handle = trimmed.substring(0, 20);
      systemStore.setPlayerName(handle);
      setOutput(prev => [...prev, `> HANDLE REGISTERED: ${handle}`, `> Launching ${awaitingNicknameForGame}...`]);
      const gameToLaunch = awaitingNicknameForGame;
      setAwaitingNicknameForGame(null);
      setTimeout(() => {
        setCurrentGame(gameToLaunch);
        systemStore.setCurrentGame(gameToLaunch);
      }, 500);
      setInput('');
      return;
    }

    // Trigger glitch effect on command
    setShowGlitch(true);
    setTimeout(() => setShowGlitch(false), 300);

    setOutput(prev => [...prev, `> ${trimmed}`]);
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    const context = {
      isAdmin: systemStore.getState().adminAuthenticated,
      systemMode: 'ANOMALY' as const,
      pathname: window.location.pathname
    };

    const result = await commandEngine.process(trimmed, context);

    // ── Standardized Output Rendering ──────────────────────────────────────
    result.outputs.forEach(out => {
      setOutput(prev => [...prev, out.text]);
    });

    // ── Action Handling ───────────────────────────────────────────────────
    if (result.action === 'navigate' && result.data) {
      if (result.data === '/') systemStore.resetAnomalyState();
      router.push(result.data);
    } else if (result.action === 'clear') {
      setOutput([]);
    } else if (result.action === 'game' && result.data) {
      setOutput(prev => [...prev, `> TARGET GAME: ${result.data.toUpperCase()}`, '> ENTER HANDLE FOR LEADERBOARD (max 20 chars):']);
      setAwaitingNicknameForGame(result.data as GameType);
    } else if (result.action === 'leaderboard' && result.data) {
      setShowLeaderboard(result.data);
    } else if (result.action === 'terminal_reset') {
      // Specialized FIX logic
      setIsRecovering(true);
      setTimeout(() => {
        const success = Math.random() < 0.3;
        if (success) {
          setOutput(prev => [...prev, '> RECOVERY SUCCESSFUL', '> Initiating system reboot...']);
          sounds.playStartup();
          setTimeout(() => {
            systemStore.setSystemMode('BOOT');
          }, 1000);
        } else {
          setOutput(prev => [...prev, '> REPAIR FAILED', '> ERROR: Core modules corrupted', '> TIP: Try again or explore other commands']);
          setIsRecovering(false);
        }
      }, 2000);
    }

    setInput('');
  };

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
    }
  };

  // Render game if active
  if (currentGame === 'snake') {
    return (
      <GameContainer>
        <SnakeGame onGameOver={(score) => handleGameOver(score, 'snake')} onExit={handleGameExit} contained theme="red" />
      </GameContainer>
    );
  }

  if (currentGame === 'pong') {
    return (
      <GameContainer>
        <PongGame onGameOver={(score) => handleGameOver(score, 'pong')} onExit={handleGameExit} contained theme="red" />
      </GameContainer>
    );
  }

  if (currentGame === 'runner') {
    return (
      <GameContainer>
        <RunnerGame onGameOver={(score) => handleGameOver(score, 'runner')} onExit={handleGameExit} contained theme="red" />
      </GameContainer>
    );
  }

  if (currentGame === 'memory') {
    return (
      <GameContainer>
        <MemoryGame onGameOver={(score) => handleGameOver(score, 'memory')} onExit={handleGameExit} contained theme="red" />
      </GameContainer>
    );
  }

  // Terminal view
  return (
    <div className="w-full max-w-4xl mx-auto relative flex-1 flex flex-col min-h-0">
      {showLeaderboard && (
        <LeaderboardDisplay
          game={showLeaderboard}
          onClose={() => setShowLeaderboard(null)}
        />
      )}
      {/* Glitch overlay */}
      {showGlitch && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="text-red-500 opacity-70 animate-red-glitch font-mono text-sm">
            ... PROCESSING COMMAND ...
          </div>
        </div>
      )}

      {/* Terminal output - FLEX, SCROLLABLE - RED THEME */}
      <div
        ref={outputRef}
        className="bg-transparent p-4 flex-1 overflow-y-auto font-mono text-sm text-red-500 mb-2 scrollbar-red"
      >
        {output.map((line, i) => (
          <div 
            key={i} 
            className={`whitespace-pre-wrap ${
              line.includes('ERROR') || line.includes('FAILED') || line.includes('CRITICAL')
                ? 'text-red-400 font-bold animate-pulse' 
                : line.includes('SUCCESS') || line.includes('RECOVERY SUCCESSFUL')
                  ? 'text-red-300 font-bold'
                  : line.includes('WARNING') || line.includes('COMPROMISED')
                    ? 'text-red-400'
                    : line.startsWith('>')
                      ? 'text-red-500'
                      : line.includes('...')
                        ? 'text-red-400/60 italic'
                        : 'text-red-500'
            }`}
          >
            {line}
          </div>
        ))}
        {isRecovering && (
          <div className="animate-pulse text-red-400">
            Processing...
          </div>
        )}
      </div>

      {/* Terminal input - RED THEME */}
      <div className="flex items-center bg-transparent border-t border-red-500/20 pt-4 p-2 font-mono text-sm transition-shadow">
        <span className="text-red-500 mr-2">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRecovering}
          className="flex-1 bg-transparent text-red-500 outline-none disabled:opacity-50 placeholder:text-red-500/30"
          placeholder={awaitingNicknameForGame ? "enter handle..." : "enter command..."}
        />
        <span className="text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">█</span>
      </div>

      <div className="text-xs text-red-500 opacity-50 mt-2 font-mono">
        TIP: Use ↑/↓ for command history
      </div>
    </div>
  );
}

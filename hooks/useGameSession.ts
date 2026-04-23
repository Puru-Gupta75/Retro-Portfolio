'use client';

import { useState, useCallback } from 'react';

type GameType = 'snake' | 'pong' | 'runner' | 'memory' | null;
type GameState = 'terminal' | 'nickname' | 'playing' | 'gameover';

interface GameSession {
  gameState: GameState;
  currentGame: GameType;
  playerName: string;
  finalScore: number;
  launchGame: (game: GameType) => void;
  setNickname: (name: string) => void;
  endGame: (score: number) => void;
  restartGame: () => void;
  exitToTerminal: () => void;
}

export function useGameSession(): GameSession {
  const [gameState, setGameState] = useState<GameState>('terminal');
  const [currentGame, setCurrentGame] = useState<GameType>(null);
  const [playerName, setPlayerName] = useState('');
  const [finalScore, setFinalScore] = useState(0);

  const launchGame = useCallback((game: GameType) => {
    setCurrentGame(game);
    setGameState('nickname');
  }, []);

  const setNickname = useCallback((name: string) => {
    setPlayerName(name);
    setGameState('playing');
  }, []);

  const endGame = useCallback((score: number) => {
    setFinalScore(score);
    setGameState('gameover');
  }, []);

  const restartGame = useCallback(() => {
    setGameState('nickname');
  }, []);

  const exitToTerminal = useCallback(() => {
    setGameState('terminal');
    setCurrentGame(null);
    setPlayerName('');
    setFinalScore(0);
  }, []);

  return {
    gameState,
    currentGame,
    playerName,
    finalScore,
    launchGame,
    setNickname,
    endGame,
    restartGame,
    exitToTerminal
  };
}

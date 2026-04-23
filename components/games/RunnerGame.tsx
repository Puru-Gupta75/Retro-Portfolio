'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameAudio } from '@/lib/gameAudio';

interface RunnerGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
  contained?: boolean;
  theme?: 'amber' | 'red';
}

const WIDTH = 420;
const HEIGHT = 150;
const PLAYER_SIZE = 20;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_HEIGHT = 30;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;

export default function RunnerGame({ onGameOver, onExit, contained = false, theme = 'amber' }: RunnerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'over'>('playing');
  
  const playerRef = useRef({ y: HEIGHT - PLAYER_SIZE - 10, velocityY: 0, isJumping: false });
  const obstaclesRef = useRef<{ x: number; passed: boolean }[]>([]);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const frameCountRef = useRef(0);
  const speedRef = useRef(3);

  const endGame = useCallback(() => {
    setGameState('over');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    onGameOver(score);
  }, [score, onGameOver]);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const player = playerRef.current;
    const obstacles = obstaclesRef.current;
    const groundY = HEIGHT - 10;

    frameCountRef.current++;

    // Spawn obstacles
    if (frameCountRef.current % 100 === 0) {
      obstacles.push({ x: WIDTH, passed: false });
    }

    // Increase difficulty
    if (frameCountRef.current % 500 === 0) {
      speedRef.current += 0.5;
    }

    // Update player
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Ground collision
    if (player.y >= groundY - PLAYER_SIZE) {
      player.y = groundY - PLAYER_SIZE;
      player.velocityY = 0;
      player.isJumping = false;
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= speedRef.current;

      // Check collision
      const playerX = 50;
      if (
        obs.x < playerX + PLAYER_SIZE &&
        obs.x + OBSTACLE_WIDTH > playerX &&
        player.y + PLAYER_SIZE > groundY - OBSTACLE_HEIGHT
      ) {
        GameAudio.playError();
        endGame();
        return;
      }

      // Score point
      if (!obs.passed && obs.x + OBSTACLE_WIDTH < playerX) {
        obs.passed = true;
        setScore(s => s + 1);
        GameAudio.playClick();
      }

      // Remove off-screen obstacles
      if (obs.x + OBSTACLE_WIDTH < 0) {
        obstacles.splice(i, 1);
      }
    }

    // Clear canvas
    ctx.fillStyle = contained ? 'transparent' : '#000';
    if (!contained) {
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } else {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    const themeColor = theme === 'red' ? '#ef4444' : '#fbbf24';

    // Draw ground
    ctx.strokeStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(WIDTH, groundY);
    ctx.stroke();

    // Draw player
    ctx.fillStyle = themeColor;
    ctx.fillRect(50, player.y, PLAYER_SIZE, PLAYER_SIZE);

    // Draw obstacles
    ctx.fillStyle = theme === 'red' ? '#f87171' : '#f00';
    obstacles.forEach(obs => {
      ctx.fillRect(obs.x, groundY - OBSTACLE_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_HEIGHT);
    });


    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [score, endGame, contained, theme]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const player = playerRef.current;

      if (contained && [' ', 'arrowup', 'w'].includes(key)) {
        e.preventDefault();
      }

      if ((key === ' ' || key === 'arrowup' || key === 'w') && !player.isJumping) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
      }
      if (key === 'escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress, { passive: false });
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, onExit, contained]);

  if (contained) {
    const isRed = theme === 'red';
    return (
      <div className={`flex flex-col items-center justify-center w-full font-mono ${isRed ? 'text-red-500' : 'text-primary'}`}>
        <div className="mb-3 text-center">
          <h2 className={`text-base font-bold tracking-[0.3em] uppercase ${isRed ? 'text-red-500' : 'text-primary/80'}`}>RUNNER</h2>
          <p className={`text-xs mt-1 ${isRed ? 'text-red-400' : 'text-primary/60'}`}>OBSTACLES: {score} &nbsp;·&nbsp; SPACE / W / ↑ to jump &nbsp;·&nbsp; ESC exit</p>
        </div>
        
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className={`border ${isRed ? 'border-red-500/30' : 'border-primary/20'}`}
        />

        {gameState === 'over' && (
          <div className="mt-3 text-center">
            <p className={`text-sm font-mono font-bold tracking-widest animate-pulse ${isRed ? 'text-red-500' : 'text-primary'}`}>COLLISION_DETECTED — SCORE: {score}</p>
          </div>
        )}
      </div>
    );
  }

  const isRed = theme === 'red';
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-black font-mono p-4 ${isRed ? 'text-red-500' : 'text-primary'}`}>
      <div className="mb-4 text-center">
        <h2 className="text-2xl mb-2 uppercase tracking-tighter font-bold">RUNNER</h2>
        <p className="text-sm opacity-70">OBSTACLES CLEARED: {score}</p>
        <p className="text-xs opacity-50 mt-2">SPACE/W/↑ to jump | ESC to exit</p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className={`border ${isRed ? 'border-red-500' : 'border-primary'}`}
      />

      {gameState === 'over' && (
        <div className="mt-4 text-center">
          <p className={`text-xl ${isRed ? 'text-red-500' : 'text-primary'} animate-pulse`}>GAME OVER</p>
          <p className="text-sm mt-2">Final Score: {score}</p>
        </div>
      )}
    </div>
  );
}

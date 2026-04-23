'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameAudio } from '@/lib/gameAudio';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
  contained?: boolean;
  theme?: 'amber' | 'red';
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

export default function SnakeGame({ onGameOver, onExit, contained = false, theme = 'amber' }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'over'>('playing');
  
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Position>(generateFood());
  const gameLoopRef = useRef<number | undefined>(undefined);

  function generateFood(): Position {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }

  const endGame = useCallback(() => {
    setGameState('over');
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    onGameOver(score);
  }, [score, onGameOver]);

  const gameLoop = useCallback(() => {
    const snake = snakeRef.current;
    const direction = directionRef.current;
    const food = foodRef.current;

    // Calculate new head position
    const head = { ...snake[0] };
    switch (direction) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      GameAudio.playError();
      endGame();
      return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      GameAudio.playError();
      endGame();
      return;
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
      setScore(s => s + 10);
      foodRef.current = generateFood();
      GameAudio.playSuccess();
    } else {
      snake.pop();
    }

    // Draw
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = contained ? 'transparent' : '#000';
    if (!contained) {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const themeColor = theme === 'red' ? '#ef4444' : '#fbbf24';

    // Draw grid
    ctx.strokeStyle = themeColor;
    ctx.globalAlpha = 0.1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw snake
    ctx.fillStyle = themeColor;
    snake.forEach((segment, i) => {
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      if (i === 0) {
        // Draw eyes on head
        ctx.fillStyle = '#000';
        ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + 5, 3, 3);
        ctx.fillRect(segment.x * CELL_SIZE + 12, segment.y * CELL_SIZE + 5, 3, 3);
        ctx.fillStyle = themeColor;
      }
    });

    // Draw food
    ctx.fillStyle = theme === 'red' ? '#f87171' : '#f59e0b';
    ctx.fillRect(
      food.x * CELL_SIZE + 2,
      food.y * CELL_SIZE + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4
    );

    // Continue loop
    setTimeout(() => {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, INITIAL_SPEED);
  }, [endGame, contained]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const currentDir = directionRef.current;

      // Prevent default scrolling for arrow keys and spacebar when contained
      if (contained && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
      }

      if ((key === 'arrowup' || key === 'w') && currentDir !== 'DOWN') {
        directionRef.current = 'UP';
      } else if ((key === 'arrowdown' || key === 's') && currentDir !== 'UP') {
        directionRef.current = 'DOWN';
      } else if ((key === 'arrowleft' || key === 'a') && currentDir !== 'RIGHT') {
        directionRef.current = 'LEFT';
      } else if ((key === 'arrowright' || key === 'd') && currentDir !== 'LEFT') {
        directionRef.current = 'RIGHT';
      } else if (key === 'escape') {
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

  // Contained mode: render without full screen takeover
  if (contained) {
    const isRed = theme === 'red';
    return (
      <div className={`flex flex-col items-center justify-center w-full font-mono ${isRed ? 'text-red-500' : 'text-primary'}`}>
        <div className="mb-3 text-center">
          <h2 className={`text-base font-bold tracking-[0.3em] uppercase ${isRed ? 'text-red-500' : 'text-primary/80'}`}>SNAKE</h2>
          <p className={`text-xs mt-1 ${isRed ? 'text-red-400' : 'text-primary/60'}`}>SCORE: {score} &nbsp;·&nbsp; WASD / Arrows &nbsp;·&nbsp; ESC exit</p>
        </div>
        
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className={`border ${isRed ? 'border-red-500/30' : 'border-primary/20'}`}
          style={{ imageRendering: 'pixelated' }}
        />

        {gameState === 'over' && (
          <div className="mt-3 text-center">
            <p className={`text-sm font-mono font-bold tracking-widest animate-pulse ${isRed ? 'text-red-500' : 'text-primary'}`}>PROCESS_TERMINATED — SCORE: {score}</p>
          </div>
        )}
      </div>
    );
  }

  // Full screen mode (original)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono p-4">
      <div className="mb-4 text-center">
        <h2 className="text-2xl mb-2">SNAKE</h2>
        <p className="text-sm opacity-70">SCORE: {score}</p>
        <p className="text-xs opacity-50 mt-2">WASD or Arrow Keys | ESC to exit</p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border border-green-500"
      />

      {gameState === 'over' && (
        <div className="mt-4 text-center">
          <p className="text-xl text-red-500">GAME OVER</p>
          <p className="text-sm mt-2">Final Score: {score}</p>
        </div>
      )}
    </div>
  );
}

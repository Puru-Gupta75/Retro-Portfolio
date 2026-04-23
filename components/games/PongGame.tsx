'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameAudio } from '@/lib/gameAudio';

interface PongGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
  contained?: boolean;
  theme?: 'amber' | 'red';
}

const WIDTH = 400;
const HEIGHT = 300;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 8;

export default function PongGame({ onGameOver, onExit, contained = false, theme = 'amber' }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'over'>('playing');
  
  const paddleYRef = useRef(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const ballRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2, dx: 3, dy: 3 });
  const gameLoopRef = useRef<number | undefined>(undefined);
  const keysRef = useRef({ up: false, down: false });

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

    const ball = ballRef.current;
    const paddleY = paddleYRef.current;

    // Move paddle
    if (keysRef.current.up && paddleY > 0) {
      paddleYRef.current -= 5;
    }
    if (keysRef.current.down && paddleY < HEIGHT - PADDLE_HEIGHT) {
      paddleYRef.current += 5;
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top/bottom
    if (ball.y <= 0 || ball.y >= HEIGHT - BALL_SIZE) {
      ball.dy *= -1;
    }

    // Ball collision with right wall (AI paddle - always hits)
    if (ball.x >= WIDTH - BALL_SIZE - PADDLE_WIDTH) {
      ball.dx *= -1;
      ball.x = WIDTH - BALL_SIZE - PADDLE_WIDTH;
    }

    // Ball collision with left paddle (player)
    if (
      ball.x <= PADDLE_WIDTH &&
      ball.y >= paddleYRef.current &&
      ball.y <= paddleYRef.current + PADDLE_HEIGHT
    ) {
      ball.dx *= -1;
      ball.x = PADDLE_WIDTH;
      setScore(s => s + 1);
      GameAudio.playClick();
      
      // Increase difficulty
      ball.dx *= 1.05;
      ball.dy *= 1.05;
    }

    // Ball out of bounds (left side)
    if (ball.x < 0) {
      GameAudio.playError();
      endGame();
      return;
    }

    // Clear canvas
    ctx.fillStyle = contained ? 'transparent' : '#000';
    if (!contained) {
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } else {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }

    const themeColor = theme === 'red' ? '#ef4444' : '#fbbf24';

    // Draw center line
    ctx.strokeStyle = themeColor;
    ctx.globalAlpha = 0.3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Draw paddles
    ctx.fillStyle = themeColor;
    ctx.fillRect(0, paddleYRef.current, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(WIDTH - PADDLE_WIDTH, ball.y - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = themeColor;
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

    // Draw score
    ctx.font = '20px monospace';
    ctx.fillText(score.toString(), 20, 30);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [score, endGame, contained, theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (contained && ['arrowup', 'arrowdown', 'w', 's'].includes(key)) {
        e.preventDefault();
      }
      if (key === 'arrowup' || key === 'w') keysRef.current.up = true;
      if (key === 'arrowdown' || key === 's') keysRef.current.down = true;
      if (key === 'escape') onExit();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (contained && ['arrowup', 'arrowdown', 'w', 's'].includes(key)) {
        e.preventDefault();
      }
      if (key === 'arrowup' || key === 'w') keysRef.current.up = false;
      if (key === 'arrowdown' || key === 's') keysRef.current.down = false;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
          <h2 className={`text-base font-bold tracking-[0.3em] uppercase ${isRed ? 'text-red-500' : 'text-primary/80'}`}>PONG</h2>
          <p className={`text-xs mt-1 ${isRed ? 'text-red-400' : 'text-primary/60'}`}>HITS: {score} &nbsp;·&nbsp; W/S or Arrows &nbsp;·&nbsp; ESC exit</p>
        </div>

        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className={`border ${isRed ? 'border-red-500/30' : 'border-primary/20'}`}
        />

        {gameState === 'over' && (
          <div className="mt-3 text-center">
            <p className={`text-sm font-mono font-bold tracking-widest animate-pulse ${isRed ? 'text-red-500' : 'text-primary'}`}>PACKET_LOST — SCORE: {score}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500 font-mono p-4">
      <div className="mb-4 text-center">
        <h2 className="text-2xl mb-2">PONG</h2>
        <p className="text-sm opacity-70">HITS: {score}</p>
        <p className="text-xs opacity-50 mt-2">W/S or Arrow Keys | ESC to exit</p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
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

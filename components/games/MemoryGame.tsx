'use client';

import { useEffect, useState, useCallback } from 'react';
import { GameAudio } from '@/lib/gameAudio';

interface MemoryGameProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
  contained?: boolean;
  theme?: 'amber' | 'red';
}

type Card = {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const ALL_SYMBOLS = [
  '/game-assets/memory/Ecology-Nuclear-Energy--Streamline-Pixel.png',
  '/game-assets/memory/Ecology-Tree--Streamline-Pixel.png',
  '/game-assets/memory/Ecology-Windmill-1--Streamline-Pixel.png',
  '/game-assets/memory/Ecology-Windmill-2--Streamline-Pixel.png',
  '/game-assets/memory/Entertainment-Events-Hobbies-Bomb--Streamline-Pixel.png',
  '/game-assets/memory/Entertainment-Events-Hobbies-Chess-Knight--Streamline-Pixel.png',
  '/game-assets/memory/Entertainment-Events-Hobbies-Chess-Pawn--Streamline-Pixel.png',
  '/game-assets/memory/Entertainment-Events-Hobbies-Chess-Rook--Streamline-Pixel.png',
  '/game-assets/memory/Entertainment-Events-Hobbies-Game-Machines-Arcade-1--Streamline-Pixel.png',
  '/game-assets/memory/Entertainment-Events-Hobbies-Game-Pool-Snooker-Ball--Streamline-Pixel.png',
  '/game-assets/memory/Entertainment-Events-Hobbies-Horror-Ghost--Streamline-Pixel.png',
  '/game-assets/memory/Entertainment-Events-Hobbies-Ticket--Streamline-Pixel.png',
  '/game-assets/memory/Entertainment-Events-Hobbies-Video-Camera-Film-1--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Bread--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Coffee--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Coffee-Cup--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Desert-Cake--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Desert-Cake-Pond--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Desert-Icecream--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Egg--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Fish--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Fish-Bone--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Pizza--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Rice-Ball--Streamline-Pixel.png',
  '/game-assets/memory/Food-Drink-Sushi--Streamline-Pixel.png',
  '/game-assets/memory/Hand-Cross-Finger-Heart--Streamline-Pixel.png',
  '/game-assets/memory/Health-Drugs-Cannabis--Streamline-Pixel.png',
  '/game-assets/memory/Logo-Linkedin--Streamline-Pixel.png',
  '/game-assets/memory/Logo-Social-Media-Facebook-Circle--Streamline-Pixel.png',
  '/game-assets/memory/Logo-Social-Media-Youtube--Streamline-Pixel.png',
  '/game-assets/memory/Logo-Whatapp--Streamline-Pixel.png',
  '/game-assets/memory/Map-Navigation-Location-Focus--Streamline-Pixel.png',
  '/game-assets/memory/Music-Disk-Cd-1--Streamline-Pixel.png',
  '/game-assets/memory/Music-Disk-Cd-2--Streamline-Pixel.png',
  '/game-assets/memory/Music-Headphones-Human--Streamline-Pixel.png',
  '/game-assets/memory/Music-Vinyl-Record--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Bear--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Buffalo--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Cat--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Dog--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Frog--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Frog-Face--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Gorilla--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Ox--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Pig--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Rabbit-1--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Rabbit-2--Streamline-Pixel.png',
  '/game-assets/memory/Pet-Animals-Turtle--Streamline-Pixel.png',
  '/game-assets/memory/School-Science-Bag--Streamline-Pixel.png',
  '/game-assets/memory/School-Science-Dna--Streamline-Pixel.png',
  '/game-assets/memory/School-Science-Graduation-Cap--Streamline-Pixel.png',
  '/game-assets/memory/School-Science-Test-Flask--Streamline-Pixel.png',
  '/game-assets/memory/Transportation-Bicycle--Streamline-Pixel.png',
  '/game-assets/memory/Transportation-Helicopter--Streamline-Pixel.png',
  '/game-assets/memory/Transportation-Motorcycle--Streamline-Pixel.png',
  '/game-assets/memory/Transportation-Plane--Streamline-Pixel.png',
  '/game-assets/memory/Transportation-Train--Streamline-Pixel.png',
  '/game-assets/memory/Transportation-Truck--Streamline-Pixel.png',
  '/game-assets/memory/Transportation-Vintage-Train--Streamline-Pixel.png',
  '/game-assets/memory/Travel-Wayfinding-Balloon--Streamline-Pixel.png',
  '/game-assets/memory/Travel-Wayfinding-Beach-Coconut-Tree--Streamline-Pixel.png',
  '/game-assets/memory/Travel-Wayfinding-Beach-Umbrella--Streamline-Pixel.png',
  '/game-assets/memory/Travel-Wayfinding-Pool-Ladder--Streamline-Pixel.png',
  '/game-assets/memory/Weather-Cloud-Sun-Fine--Streamline-Pixel.png',
  '/game-assets/memory/Weather-Cresent-Moon-Stars--Streamline-Pixel.png',
  '/game-assets/memory/Weather-Rainbow--Streamline-Pixel.png',
  '/game-assets/memory/Weather-Umbrella--Streamline-Pixel.png'
];

const GRID_TOTAL = 16; 
const PAIRS_NEEDED = 8;

// Fisher-Yates shuffle for true randomness
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function MemoryGame({ onGameOver, onExit, contained = false, theme = 'amber' }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameState, setGameState] = useState<'playing' | 'over'>('playing');

  // Initialize cards
  useEffect(() => {
    // 8 pairs (16 cards)
    // Use a high-quality shuffle to pick symbols
    const selectedSymbols = shuffle(ALL_SYMBOLS).slice(0, PAIRS_NEEDED);

    const pairCards = [...selectedSymbols, ...selectedSymbols];
    
    // Shuffle the final deck multiple times for maximum randomness
    const shuffledDeck = shuffle(shuffle(pairCards)).map((symbol, id) => ({
      id,
      symbol,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(shuffledDeck);
  }, []);

  // Effect to handle game over logic cleanly
  useEffect(() => {
    if (matches === PAIRS_NEEDED && gameState === 'playing') {
      setGameState('over');
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const score = Math.max(1000 - moves * 10 - timeTaken, 100);
      
      // Delay high-level callback to allow for local match animation
      const timer = setTimeout(() => {
        onGameOver(score);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [matches, gameState, moves, startTime, onGameOver]);

  const handleCardClick = useCallback((index: number) => {
    if (
      flippedIndices.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    ) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    setCards(prev =>
      prev.map((card, i) =>
        i === index ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].symbol === cards[second].symbol) {
        // Match found
        GameAudio.playSuccess();
        setTimeout(() => {
          setCards(prev =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, isMatched: true } : card
            )
          );
          setMatches(m => m + 1);
          setFlippedIndices([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedIndices([]);
        }, 1000);
      }
    }
  }, [cards, flippedIndices, moves, startTime, onGameOver]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onExit]);

  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

  if (contained) {
    const isRed = theme === 'red';
    return (
      <div className={`flex flex-col items-center justify-center w-full font-mono ${isRed ? 'text-red-500' : 'text-primary'}`}>
        <div className="mb-3 text-center">
          <h2 className={`text-base font-bold tracking-[0.3em] uppercase ${isRed ? 'text-red-500' : 'text-primary/80'}`}>MEMORY</h2>
          <p className={`text-xs mt-1 ${isRed ? 'text-red-400' : 'text-primary/60'}`}>
            MOVES: {moves} &nbsp;·&nbsp; MATCHES: {matches}/{PAIRS_NEEDED} &nbsp;·&nbsp; TIME: {elapsedTime}s &nbsp;·&nbsp; ESC exit
          </p>
        </div>

        <div className={`grid grid-cols-4 gap-2 p-3 border ${isRed ? 'border-red-500/20' : 'border-primary/10'}`}>
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={card.isMatched || card.isFlipped}
              className={`
                w-14 h-18 border font-bold text-base
                transition-all duration-200 py-3 px-2 flex items-center justify-center
                ${card.isMatched
                  ? isRed ? 'border-red-500/60 bg-red-900/20 text-red-400' : 'border-primary/60 bg-primary/10 text-primary'
                  : card.isFlipped
                    ? isRed ? 'border-red-400 bg-red-900/30 text-red-400' : 'border-primary/80 bg-primary/20 text-primary'
                    : isRed ? 'border-red-500/20 bg-black hover:border-red-500/50 cursor-pointer' : 'border-primary/10 bg-black hover:border-primary/30 cursor-pointer'
                }
              `}
            >
              {card.isFlipped || card.isMatched ? (
                <img 
                  src={card.symbol} 
                  alt="symbol" 
                  className={`w-8 h-8 object-contain image-rendering-pixelated ${isRed ? 'brightness-0 invert-[0.2] sepia-[1] saturate-10000 hue-rotate-0' : 'brightness-0 invert-[0.7] sepia-[1] saturate-10000 hue-rotate-30'}`}
                  style={{ 
                    imageRendering: 'pixelated',
                    filter: isRed 
                      ? 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' 
                      : 'brightness(0) saturate(100%) invert(70%) sepia(91%) saturate(3000%) hue-rotate(5deg) brightness(100%) contrast(105%)'
                  }}
                />
              ) : (
                <span className="opacity-20">?</span>
              )}
            </button>
          ))}
        </div>

        {gameState === 'over' && (
          <div className="mt-3 text-center">
            <p className={`text-sm font-mono font-bold tracking-widest animate-pulse ${isRed ? 'text-red-500' : 'text-primary'}`}>CACHE_SYNCHRONIZED — {moves} OPERATIONS</p>
          </div>
        )}
      </div>
    );
  }

  const isRed = theme === 'red';
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-black font-mono p-4 ${isRed ? 'text-red-500' : 'text-primary'}`}>
      <div className="mb-6 text-center">
        <h2 className="text-2xl mb-2 uppercase tracking-tighter font-bold">MEMORY_MATCH</h2>
        <div className="flex gap-6 text-sm opacity-70">
          <p>MOVES: {moves}</p>
          <p>MATCHES: {matches}/{PAIRS_NEEDED}</p>
          <p>TIME: {elapsedTime}s</p>
        </div>
        <p className="text-xs opacity-50 mt-2 italic tracking-widest">Select pairs to synchronize data blocks | ESC to exit</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={card.isMatched || card.isFlipped}
            className={`
              w-16 h-20 border-2 font-bold text-xl flex items-center justify-center
              transition-all duration-200
              ${card.isMatched
                ? isRed ? 'border-red-500 bg-red-900/30 text-red-500' : 'border-primary bg-primary/20 text-primary'
                : card.isFlipped
                  ? 'border-orange-500 bg-orange-900/30 text-orange-500'
                  : isRed ? 'border-red-500/50 bg-black hover:bg-red-900/20 cursor-pointer' : 'border-primary/50 bg-black hover:bg-primary/20 cursor-pointer'
              }
              ${!card.isFlipped && !card.isMatched ? 'hover:scale-105' : ''}
            `}
          >
            {card.isFlipped || card.isMatched ? (
              <img 
                src={card.symbol} 
                alt="symbol" 
                className="w-10 h-10 object-contain image-rendering-pixelated"
                style={{ 
                  imageRendering: 'pixelated',
                  filter: isRed 
                    ? 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)' 
                    : 'brightness(0) saturate(100%) invert(70%) sepia(91%) saturate(3000%) hue-rotate(5deg) brightness(100%) contrast(105%)'
                }}
              />
            ) : (
              <span className="opacity-20 text-2xl">?</span>
            )}
          </button>
        ))}
      </div>

      {gameState === 'over' && (
        <div className="mt-6 text-center">
          <p className={`text-xl ${isRed ? 'text-red-500' : 'text-primary'} animate-pulse font-bold tracking-widest uppercase`}>COMPLETE!</p>
          <p className="text-sm mt-2 opacity-60">Moves: {moves} | Time: {elapsedTime}s</p>
        </div>
      )}
    </div>
  );
}

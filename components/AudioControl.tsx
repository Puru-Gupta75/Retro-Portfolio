'use client';

import React from 'react';
import { useSystem } from '@/context/SystemContext';

export const AudioControl: React.FC = () => {
  const { audioEnabled, toggleAudio } = useSystem();

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; AUDIO_HANDSHAKE
      </h3>
      
      <button
        onClick={toggleAudio}
        className={`
          w-full py-4 font-mono text-xs transition-all border
          ${audioEnabled 
            ? 'bg-primary text-black phosphor-glow border-primary' 
            : 'border-primary/20 text-primary/40 hover:text-primary hover:bg-primary/5'}
        `}
      >
        {audioEnabled ? '[ AUDIO: ON ]' : '[ AUDIO: MUTED ]'}
      </button>
      <p className="text-[9px] font-mono opacity-20 uppercase tracking-widest text-center">
        System beep and motor hum simulation.
      </p>
    </div>
  );
};

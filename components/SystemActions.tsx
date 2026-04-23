'use client';

import React from 'react';
import { useSystem } from '@/context/SystemContext';

export const SystemActions: React.FC = () => {
  const { resetSystem, setIsBooting } = useSystem();

  const handleRestartBoot = () => {
    setIsBooting(true);
  };

  const handleClearState = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; SYSTEM_OPERATIONS
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <button
          onClick={resetSystem}
          className="py-3 px-4 font-mono text-[10px] border border-primary/20 hover:border-primary hover:bg-primary/5 transition-all uppercase"
        >
          [ RESET_SYSTEM ]
        </button>
        <button
          onClick={handleRestartBoot}
          className="py-3 px-4 font-mono text-[10px] border border-primary/20 hover:border-primary hover:bg-primary/5 transition-all uppercase"
        >
          [ RESTART_BOOT ]
        </button>
        <button
          onClick={handleClearState}
          className="py-3 px-4 font-mono text-[10px] border border-red-500/40 text-red-500/60 hover:border-red-500 hover:bg-red-500/5 transition-all uppercase"
        >
          [ WIPE_ALL_DATA ]
        </button>
      </div>
    </div>
  );
};

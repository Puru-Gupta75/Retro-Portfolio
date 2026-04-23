'use client';

import React from 'react';

interface StatusConsoleProps {
  logs: string[];
}

export const StatusConsole: React.FC<StatusConsoleProps> = ({ logs }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; SYSTEM_TRANSMISSION_CONSOLE
      </h3>
      
      <div 
        ref={scrollRef}
        className="h-48 bg-surface/30 border border-primary/10 p-6 overflow-y-auto scrollbar-hide font-mono text-[11px] space-y-1"
      >
        {logs.map((log, i) => (
          <div key={i} className={log.includes('[OK]') ? 'text-primary font-bold' : log.includes('ERR') ? 'text-red-500' : 'text-primary/60'}>
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="opacity-20 italic">IDLE_STATE // AWAITING_PACKET_INIT</div>
        )}
        <div className="inline-block w-2 h-3 bg-primary animate-pulse ml-1 align-middle" />
      </div>
    </div>
  );
};

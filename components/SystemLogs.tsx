'use client';

import React, { useEffect, useRef, useState } from 'react';
import { systemStore, Log } from '@/store/useSystemStore';

const TYPE_COLOR: Record<Log['type'], string> = {
  INFO:   'text-primary/60',
  ACTION: 'text-primary',
  ERROR:  'text-red-400',
};

function ts(n: number) {
  const d = new Date(n);
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':');
}

export const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setLogs([...systemStore.getState().logs]);
    sync();
    return systemStore.subscribe(sync);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollTop = bottomRef.current.scrollHeight;
    }
  }, [logs]);

  // Display oldest-first (logs stored newest-first in store)
  const ordered = [...logs].reverse();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
          &gt; SYSTEM_LOGS
        </h3>
        <span className="text-[9px] font-mono opacity-20 uppercase tracking-widest">
          {logs.length}/50
        </span>
      </div>

      <div
        ref={bottomRef}
        className="bg-primary/5 border border-primary/10 h-52 overflow-y-auto scrollbar-hide p-3 space-y-px"
        aria-live="polite"
        aria-label="System log stream"
      >
        {ordered.length === 0 ? (
          <p className="text-[10px] font-mono opacity-20 uppercase tracking-widest">
            AWAITING EVENTS...
          </p>
        ) : (
          ordered.map((log) => (
            <div key={log.id} className={`font-mono text-[10px] leading-relaxed ${TYPE_COLOR[log.type]}`}>
              <span className="opacity-30">[{ts(log.timestamp)}]</span>
              {' '}
              <span className="opacity-50">[{log.type.padEnd(6)}]</span>
              {' '}
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

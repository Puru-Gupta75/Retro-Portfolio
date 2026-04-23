'use client';

import React, { useState } from 'react';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const QuickCommands: React.FC = () => {
  const { config } = useSiteConfig();
  const commands = config?.uplink?.commands ?? [];
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const executeCommand = (cmdStr: string) => {
    const found = commands.find((c) => c.cmd.toLowerCase() === cmdStr.toLowerCase());
    if (found) {
      if (found.action === 'COPY' && found.value) {
        navigator.clipboard.writeText(found.value);
        setCopiedCmd(found.cmd);
        setTimeout(() => setCopiedCmd(null), 2000);
      } else if (found.url) {
        window.open(found.url, '_blank');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-[10px] font-mono tracking-[0.3em] opacity-40 uppercase">
        &gt; QUICK_ACCESS_NODES
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {commands.map((item) => (
          <button
            key={item.cmd}
            onClick={() => executeCommand(item.cmd)}
            className="group flex justify-between items-center bg-surface/30 p-3 border border-primary/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <span className="font-mono text-primary text-[11px] font-bold tracking-widest">{item.cmd}</span>
            <span className="font-mono text-[9px] opacity-20 group-hover:opacity-60 transition-opacity">
              {copiedCmd === item.cmd ? '[ COPIED ]' : item.label}
            </span>
          </button>
        ))}
      </div>


    </div>
  );
};

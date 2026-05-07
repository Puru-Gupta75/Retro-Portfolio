'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SystemAlert } from './SystemAlert';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'emergency';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (message: string, title = "SYSTEM ALERT", type: 'info' | 'emergency' = 'info') => {
    setAlertState({ isOpen: true, message, title, type });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = command.toLowerCase().trim();
    const parts = cmd.split(' ');
    const base = parts[0];
    const args = parts.slice(1);
    
    if (base === 'go') {
      const page = args[0];
      if (['home', 'archive', 'profile', 'uplink', 'system'].includes(page)) {
        router.push(page === 'home' ? '/' : `/${page}`);
        setIsOpen(false);
      }
    } else if (base === 'play') {
      showAlert(
        "CRITICAL: GAME MODULES LOCKED.\n\nEmergency Protocol 404 is active. Access to entertainment subsystems is restricted to SYSTEM ANOMALY conditions only.\n\n[ Error Code: ERR_RESTRICTED_ACCESS ]",
        "PROTOCOL VIOLATION",
        "emergency"
      );
    } else if (base === 'status') {
      showAlert(
        "SYSTEM STATUS: NOMINAL\nUPTIME: 100%\nMODULES: ALL ACTIVE\nENCRYPTION: AES-256-GCM\n\nAll systems functioning within expected parameters.",
        "SYSTEM DIAGNOSTICS",
        "info"
      );
    } else if (base === 'about') {
      showAlert(
        "AMBER_OS v1.2.0\nBUILD: PHOSPHOR_GHOST\nLOC: DELHI_IN\nIDENTITY: PURU\n\n[ Developed for high-fidelity terminal interactions ]",
        "SYSTEM INFO",
        "info"
      );
    } else if (base === 'help' || base === '?') {
      showAlert(
        "AVAILABLE COMMANDS:\n- go [page]\n- status\n- about\n- clear\n- exit\n\nUsage: type command and press ENTER.",
        "COMMAND DIRECTORY",
        "info"
      );
    } else if (base === 'clear') {
      setCommand('');
    } else if (base === 'exit') {
      setIsOpen(false);
    }
    
    setCommand('');
  };

  return (
    <>
      {!isOpen ? null : (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="fixed inset-0 z-1000 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg bg-black border-2 border-primary/30 p-8 shadow-[0_0_50px_rgba(0,255,159,0.1)]">
            <form onSubmit={handleCommand} className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-mono text-primary/60 uppercase tracking-widest">
                  :: AMBER_SYS_PROMPT v1.2
                </label>
                <span className="text-[10px] font-mono text-primary/30">ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-4 text-primary font-mono text-2xl border-b border-primary/20 pb-2">
                <span className="animate-pulse">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none caret-primary uppercase tracking-wider"
                  placeholder="TYPE COMMAND..."
                  autoComplete="off"
                />
              </div>
              <div className="pt-4 grid grid-cols-2 gap-4 text-[9px] text-primary/40 font-mono uppercase tracking-tighter">
                <div className="space-y-1">
                  <p className="text-primary/60 mb-2">:: NAVIGATION</p>
                  <p>GO HOME | PROFILE | ARCHIVE</p>
                  <p>GO UPLINK | SYSTEM</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-primary/60 mb-2">:: SYSTEM</p>
                  <p>STATUS | ABOUT | HELP</p>
                  <p>CLEAR | EXIT [ESC]</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <SystemAlert 
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </>
  );
};

'use client';

import React, { useEffect, useState } from 'react';

interface SystemAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'info' | 'emergency';
}

export const SystemAlert: React.FC<SystemAlertProps> = ({ 
  isOpen, 
  onClose, 
  title = "SYSTEM ALERT", 
  message,
  type = 'info'
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setDisplayedText('');
      setIsTyping(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isRendered && isOpen && displayedText.length < message.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(message.slice(0, displayedText.length + 1));
      }, 10);
      return () => clearTimeout(timeout);
    } else if (displayedText.length === message.length) {
      setIsTyping(false);
    }
  }, [displayedText, message, isRendered, isOpen]);

  if (!isRendered) return null;

  const isEmergency = type === 'emergency';
  const primaryColor = isEmergency ? 'text-red-500' : 'text-primary';
  const borderColor = isEmergency ? 'border-red-500/50' : 'border-primary/30';
  const glowClass = isEmergency ? 'shadow-[0_0_40px_rgba(239,68,68,0.15)]' : 'shadow-[0_0_40px_rgba(255,176,0,0.1)]';
  const accentColor = isEmergency ? 'bg-red-500' : 'bg-primary';

  return (
    <div 
      className={`fixed inset-0 z-[2000] flex items-center justify-center p-4 transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop with chromatic aberration effect */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-lg bg-[#050505] border border-white/5 p-1 ${glowClass} animate-in zoom-in-95 duration-500 overflow-hidden`}
      >
        {/* Top Progress Bar / Scanning Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden">
          <div className={`h-full ${accentColor} animate-[scan_2s_linear_infinite] w-1/3`} />
        </div>

        {/* Interior Border */}
        <div className={`border ${borderColor} p-6 relative`}>
          {/* Scanlines Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className={`flex items-center gap-2 mb-1`}>
                <div className={`w-2 h-2 ${accentColor} ${isEmergency ? 'animate-pulse' : ''}`} />
                <h2 className={`font-mono text-[10px] uppercase tracking-[0.3em] ${primaryColor}`}>
                  {title}
                </h2>
              </div>
              <div className="h-[1px] w-24 bg-gradient-to-r from-current to-transparent opacity-30" style={{ color: isEmergency ? '#ef4444' : '#FFB000' }} />
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-white/20 block uppercase tracking-tighter">SEC_LEVEL: {isEmergency ? 'CRITICAL' : 'STANDARD'}</span>
              <span className="text-[9px] font-mono text-white/20 block uppercase tracking-tighter">TIMESTAMP: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Body */}
          <div className="mb-10 relative">
            <div className={`font-mono text-sm leading-relaxed ${isEmergency ? 'text-red-400/90' : 'text-primary/90'} whitespace-pre-wrap min-h-[80px]`}>
              {displayedText}
              {isTyping && <span className={`inline-block w-2 h-4 ${accentColor} ml-1 animate-pulse align-middle`} />}
            </div>
            
            {/* Visual decoration */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-5 select-none">
              <pre className="text-[8px] leading-[6px] font-mono">
                {isEmergency ? `
   _  _ 
  | || |
  | || |_
  |__   _|
     |_|  
                ` : `
   ___  
  / _ \\ 
 | | | |
 | |_| |
  \\___/ 
                `}
              </pre>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white/10" />
              <div className="w-1 h-1 bg-white/10" />
              <div className="w-1 h-1 bg-white/10" />
            </div>
            
            <button 
              onClick={onClose}
              className={`group relative overflow-hidden font-mono text-[10px] uppercase tracking-[0.2em] px-8 py-3 transition-all duration-300`}
            >
              <div className={`absolute inset-0 border ${borderColor} group-hover:bg-white/5 transition-colors`} />
              <div className={`absolute bottom-0 left-0 h-[2px] ${accentColor} transition-all duration-300 w-0 group-hover:w-full`} />
              <span className={`relative z-10 ${primaryColor} group-hover:brightness-125`}>
                [ ACKNOWLEDGE_PROTOCOL ]
              </span>
            </button>
          </div>
        </div>

        {/* Corner Decors */}
        <div className={`absolute top-0 left-0 w-4 h-4 border-t border-l ${borderColor} opacity-50`} />
        <div className={`absolute top-0 right-0 w-4 h-4 border-t border-r ${borderColor} opacity-50`} />
        <div className={`absolute bottom-0 left-0 w-4 h-4 border-b border-l ${borderColor} opacity-50`} />
        <div className={`absolute bottom-0 right-0 w-4 h-4 border-b border-r ${borderColor} opacity-50`} />
      </div>

      <style jsx>{`
        @keyframes scan {
          from { transform: translateX(-100%); }
          to { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

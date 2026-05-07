'use client';

import React, { useState, useEffect, useRef } from 'react';
import BootScreen from './BootScreen';
import CRTWrapper from './CRTWrapper';
import { HUD } from './HUD';
import { Navigation } from './Navigation';
import { CommandPalette } from './CommandPalette';
import AnomalyTerminal from './AnomalyTerminal';
import { CRTWebGLWrapperSafe } from './CRTWebGLWrapperSafe';
import { usePathname, useRouter } from 'next/navigation';
import { systemStore } from '@/store/useSystemStore';

interface AppShellProps {
  children: React.ReactNode;
}

import { useSystem } from '@/context/SystemContext';
import { sounds } from '@/lib/soundEngine';

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isBooting, setIsBooting, device } = useSystem();
  const [showContent, setShowContent] = useState(false);
  const [systemMode, setSystemMode] = useState(() => systemStore.getState().systemMode);
  const [showRedFlash, setShowRedFlash] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isMobile = device === 'mobile';

  const router = useRouter();

  // Uptime ticker — runs globally, always mounted
  useEffect(() => {
    const interval = setInterval(() => systemStore.tickUptime(), 1000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to system mode changes
  useEffect(() => {
    return systemStore.subscribe(() => {
      const state = systemStore.getState();
      
      // Trigger red flash on entering anomaly mode
      if (state.systemMode === 'ANOMALY' && systemMode !== 'ANOMALY') {
        setShowRedFlash(true);
        setTimeout(() => setShowRedFlash(false), 300);
      }
      
      setSystemMode(state.systemMode);
      
      // When entering BOOT mode, trigger boot sequence
      if (state.systemMode === 'BOOT') {
        setIsBooting(true);
      }
    });
  }, [setIsBooting, systemMode]);

  // Reset scroll to top on every route change.
  useEffect(() => {
    let raf1: number, raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  // Trigger initial boot based on session/persistence
  useEffect(() => {
    const hasVisited = localStorage.getItem('amber_os_visited');
    const skipBootMode = sessionStorage.getItem('amber_os_skip_boot');

    if (!hasVisited && !skipBootMode) {
      setIsBooting(true);
      sounds.playStartup();
      localStorage.setItem('amber_os_visited', 'true');
      sessionStorage.setItem('amber_os_skip_boot', 'true');
    } else {
      setShowContent(true);
    }
  }, [setIsBooting]);

  useEffect(() => {
    if (!isBooting) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isBooting]);

  // Apply theme-aware data attributes to document root
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    if (systemMode === 'ANOMALY') {
      document.documentElement.setAttribute('data-theme', 'anomaly');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [systemMode]);

  // Handle boot completion
  const handleBootComplete = () => {
    setIsBooting(false);
    
    // If we were in BOOT mode (from recovery), return to NORMAL and navigate home
    const state = systemStore.getState();
    if (state.systemMode === 'BOOT') {
      // Navigation first to break out of 404 path
      window.location.href = '/';
      // Reset state (though page reload will reset most things anyway)
      systemStore.resetAnomalyState();
    }
  };

  // ANOMALY MODE: Transform main content
  const mainContent = systemMode === 'ANOMALY' ? (
    <main className={`max-w-6xl mx-auto pt-6 pb-16 px-6 h-full flex flex-col ${isMobile ? '' : 'lg:pl-56'}`}>
      {/* Anomaly Header - Integrated Style */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-2 h-2 bg-red-500 animate-red-pulse rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
          <h1 className="text-3xl font-bold text-red-500 tracking-wider font-mono drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-red-pulse anomaly-glow">
            SYSTEM ANOMALY DETECTED
          </h1>
          <div className="flex-1 h-px bg-linear-to-r from-red-500/50 to-transparent"></div>
        </div>
        <div className="text-sm text-red-400 opacity-70 font-mono uppercase tracking-widest pl-6 flex items-center gap-2">
          <span className="text-red-500">→</span>
          <span>Route not found. Terminal access granted.</span>
          <span className="text-red-500/30">|</span>
          <span className="animate-pulse">EMERGENCY MODE ACTIVE</span>
        </div>
      </div>

      {/* ASCII Separator - Red Theme */}
      <div className="text-red-500/20 font-mono text-xs mb-8 text-center">
        ═══════════════════════════════════════════════════════════════
      </div>

      {/* Anomaly Terminal */}
      <AnomalyTerminal />

      {/* ASCII Separator */}
      <div className="text-red-500/20 font-mono text-xs mt-8 text-center">
        ═══════════════════════════════════════════════════════════════
      </div>
    </main>
  ) : (
    <main className={`max-w-6xl mx-auto mt-24 mb-24 px-6 page-transition-enter ${isMobile ? '' : 'lg:pl-56'}`}>
      {children}
    </main>
  );

  const content = (
    <>
      <HUD />
      <Navigation />
      {systemMode !== 'ANOMALY' && <CommandPalette />}

      {mainContent}

      {/* Persistent Background Decor */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none text-[8px] font-mono tracking-[0.5em] uppercase">
        {systemMode === 'ANOMALY' 
          ? <span className="text-red-500">[ CRITICAL SYSTEM FAILURE // EMERGENCY_TERMINAL_MODE ]</span>
          : '[ SECURE TERMINAL CONNECTION // AMBER_OS_v1.2 ]'
        }
      </div>

      {/* Red flash on anomaly mode enter */}
      {showRedFlash && (
        <div className="fixed inset-0 bg-red-500 z-9999 animate-flash pointer-events-none" />
      )}

      {/* Anomaly visual effects */}
      {systemMode === 'ANOMALY' && (
        <>
          <div className="anomaly-scanlines" />
          <div className="anomaly-vignette" />
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen">
      {isBooting && (
        <BootScreen onComplete={handleBootComplete} />
      )}

      {showContent && (
        isMobile ? (
          // Mobile: plain container, no CRT overhead
          <div className="w-screen h-screen overflow-hidden relative bg-background">
            <div className="w-full h-full overflow-y-auto scrollbar-hide" ref={scrollRef}>
              {content}
            </div>
          </div>
        ) : (
          // Tablet + Desktop: full CRT wrapper with WebGL distortion
          <CRTWebGLWrapperSafe>
            <CRTWrapper scrollRef={scrollRef}>
              {content}
            </CRTWrapper>
          </CRTWebGLWrapperSafe>
        )
      )}
    </div>
  );
};

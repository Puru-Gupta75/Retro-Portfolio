'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { sounds } from '@/lib/soundEngine';
import { logEvent } from '@/lib/systemLogger';
import { useSystem } from '@/context/SystemContext';
import { systemStore } from '@/store/useSystemStore';
import { useSiteConfig } from '@/lib/useSiteConfig';

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { device } = useSystem();
  const { config } = useSiteConfig();
  const [systemMode, setSystemMode] = useState(() => systemStore.getState().systemMode);
  const [isAdminActive, setIsAdminActive] = useState(() => systemStore.getState().adminModuleActive);

  const isMobile = device === 'mobile';

  // Subscribe to system state changes
  useEffect(() => {
    return systemStore.subscribe(() => {
      const state = systemStore.getState();
      setSystemMode(state.systemMode);
      setIsAdminActive(state.adminModuleActive);
    });
  }, []);

  // Compute dynamic navigation nodes
  const baseItems = config?.navigation?.items ?? [];
  const visibleItems = [...baseItems];
  if (isAdminActive) {
    visibleItems.push({ id: '06', label: 'ADMIN', path: '/admin' });
  }

  // Global route tracking — feeds the system log stream
  useEffect(() => {
    logEvent(`NAVIGATED → ${pathname}`, 'ACTION');
  }, [pathname]);

  // Keyboard shortcuts — desktop only, disabled in ANOMALY mode
  useEffect(() => {
    if (isMobile || systemMode === 'ANOMALY') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if the user is typing in ANY input field or editable area
      const activeEl = document.activeElement;
      const isInputActive = 
        activeEl?.tagName === 'INPUT' || 
        activeEl?.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement)?.isContentEditable;
      
      if (isInputActive) return;

      const key = parseInt(e.key);
      if (!isNaN(key) && key >= 1 && key <= visibleItems.length) {
        sounds.playClick();
        router.push(visibleItems[key - 1].path);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, isMobile, systemMode, pathname, visibleItems]);

  // ANOMALY MODE: Disabled navigation feel
  const handleAnomalyClick = (e: React.MouseEvent) => {
    if (systemMode === 'ANOMALY') {
      e.preventDefault();
      systemStore.addLog('> ACCESS DENIED', 'ERROR');
    }
  };

  if (isMobile) {
    // Mobile: horizontal bottom nav bar with large tap targets
    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-100 flex items-center justify-around bg-black/90 border-t border-primary/20 font-mono"
        aria-label="Main navigation"
      >
        {visibleItems.map((item, index) => {
          const isActive = pathname === item.path;
          const label = systemMode === 'ANOMALY' ? 'UNKNOWN' : item.label;
          
          return (
            <Link
              key={item.id}
              href={systemMode === 'ANOMALY' ? '#' : item.path}
              onClick={(e) => {
                if (systemMode === 'ANOMALY') {
                  handleAnomalyClick(e);
                } else {
                  sounds.playClick();
                }
              }}
              className={`
                flex flex-col items-center justify-center py-3 px-2 min-w-[56px] min-h-[56px]
                text-[10px] tracking-widest uppercase transition-all duration-200
                ${systemMode === 'ANOMALY' 
                  ? 'text-red-500 cursor-not-allowed opacity-60 hover:text-red-400 hover:opacity-80' 
                  : isActive 
                    ? 'text-primary phosphor-glow' 
                    : 'text-primary/40 active:text-primary'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && systemMode !== 'ANOMALY' && (
                <span className="w-1 h-1 bg-primary mb-1" aria-hidden="true" />
              )}
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Tablet + Desktop: original fixed left sidebar
  return (
    <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-100 flex flex-col gap-4 font-mono group/nav" aria-label="Main navigation">
      {visibleItems.map((item, index) => {
        const isActive = pathname === item.path;
        const label = systemMode === 'ANOMALY' ? 'UNKNOWN' : item.label;
        const id = systemMode === 'ANOMALY' ? `[${(index + 1).toString().padStart(2, '0')}]` : `[${item.id}]`;
        
        return (
          <Link
            key={item.id}
            href={systemMode === 'ANOMALY' ? '#' : item.path}
            onMouseEnter={() => systemMode !== 'ANOMALY' && sounds.playHover()}
            onClick={(e) => {
              if (systemMode === 'ANOMALY') {
                handleAnomalyClick(e);
              } else {
                sounds.playClick();
              }
            }}
            className={`
              group flex items-center gap-4 transition-all duration-300
              ${systemMode === 'ANOMALY' 
                ? 'text-red-500 cursor-not-allowed opacity-60 hover:text-red-400 hover:opacity-80 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                : isActive 
                  ? 'text-primary' 
                  : 'text-primary/30'
              }
            `}
          >
            <span className="text-[10px] opacity-50">{id}</span>
            <span className={`
              text-sm tracking-widest relative px-2 py-1
              ${systemMode === 'ANOMALY' 
                ? '' 
                : isActive 
                  ? 'bg-primary text-black phosphor-glow scale-110' 
                  : 'hover:text-primary hover:bg-primary/10'
              }
            `}>
              {label}

              {/* Subtle hover line effect - disabled in anomaly mode */}
              {!isActive && systemMode !== 'ANOMALY' && (
                <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              )}
            </span>
          </Link>
        );
      })}

      <div className="mt-8 border-t border-primary/10 pt-4 text-[9px] opacity-20 uppercase tracking-tighter">
        {systemMode === 'ANOMALY' ? 'NAVIGATION DISABLED' : `PRESS [1-${visibleItems.length}] TO NAVIGATE`}
      </div>
    </nav>
  );
};

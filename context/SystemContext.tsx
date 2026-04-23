'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { sounds } from '@/lib/soundEngine';
import { useDeviceType, type DeviceType } from '@/hooks/useDeviceType';

// Theme is locked to amber — no switching per design rules
export type Theme = 'amber';
export type PerformanceMode = 'high' | 'low' | 'auto';

interface SystemState {
  theme: Theme;
  device: DeviceType;
  performanceMode: PerformanceMode;
  actualPerformance: 'high' | 'low';
  audioEnabled: boolean;
  crtEnabled: boolean;
  isBooting: boolean;

  setPerformanceMode: (mode: PerformanceMode) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setCrtEnabled: (enabled: boolean) => void;
  setIsBooting: (enabled: boolean) => void;

  toggleAudio: () => void;
  toggleCRT: () => void;
  resetSystem: () => void;
}

const SystemContext = createContext<SystemState | undefined>(undefined);

const STORAGE_KEY = 'amber_os_v1_settings';

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme: Theme = 'amber'; // Fixed — no theme switching
  const device = useDeviceType();
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>('auto');
  const [actualPerformance, setActualPerformance] = useState<'high' | 'low'>('high');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [isBooting, setIsBooting] = useState(false);

  const isInitialized = useRef(false);

  // 1. INITIALIZATION (Load from localStorage)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.performanceMode) setPerformanceMode(p.performanceMode);
        if (p.audioEnabled !== undefined) setAudioEnabled(p.audioEnabled);
        if (p.crtEnabled !== undefined) setCrtEnabled(p.crtEnabled);
      } catch (e) {
        console.error('Failed to parse system settings', e);
      }
    }
    isInitialized.current = true;
  }, []);

  // 2. PERFORMANCE DETECTION — also forces LOW on mobile
  useEffect(() => {
    const detectPerformance = () => {
      if (typeof window === 'undefined') return 'high' as const;
      // Mobile always gets low performance mode
      if (device === 'mobile') return 'low' as const;
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      return (memory < 4 || isMobile || isSmallScreen) ? 'low' as const : 'high' as const;
    };

    const target = performanceMode === 'auto' ? detectPerformance() : performanceMode as 'high' | 'low';
    if (actualPerformance !== target) {
      setActualPerformance(target);
    }
  }, [performanceMode, actualPerformance, device]);

  // 3. PERSISTENCE & SYSTEM APPLICATION
  // Split into two effects so DOM/audio application doesn't depend on
  // actualPerformance being set in the same render cycle as initialization.
  useEffect(() => {
    if (!isInitialized.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      performanceMode, audioEnabled, crtEnabled
    }));
  }, [performanceMode, audioEnabled, crtEnabled]);

  useEffect(() => {
    if (!isInitialized.current) return;
    // Always amber — no data-theme attribute needed
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-performance', actualPerformance);
    sounds.setEnabled(audioEnabled);
  }, [actualPerformance, audioEnabled]);

  const toggleAudio = useCallback(() => setAudioEnabled(prev => !prev), []);
  const toggleCRT = useCallback(() => setCrtEnabled(prev => !prev), []);

  const resetSystem = useCallback(() => {
    setPerformanceMode('auto');
    setAudioEnabled(false);
    setCrtEnabled(false);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SystemContext.Provider value={{
      theme, device, performanceMode, actualPerformance, audioEnabled, crtEnabled, isBooting,
      setPerformanceMode, setAudioEnabled, setCrtEnabled, setIsBooting,
      toggleAudio, toggleCRT, resetSystem
    }}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within SystemProvider');
  return context;
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { systemStore } from '@/store/useSystemStore';

export const HUD: React.FC = () => {
  const [time, setTime] = useState('00:00:00');
  const [uptime, setUptime] = useState(() => systemStore.getState().uptime);
  const [systemMode, setSystemMode] = useState(() => systemStore.getState().systemMode);
  const [anomalyRoute, setAnomalyRoute] = useState(() => systemStore.getState().anomalyRoute);

  const CRITICAL_MESSAGES = [
    'SYSTEM FAILURE', 'CORE BREACH', 'MEMORY LEAK', 'STACK OVERFLOW', 'KERNEL PANIC'
  ];

  // Stable anomaly values — generated once when anomaly mode is entered, not on every render
  const [traceId] = useState(
    () => `ERR_${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  );
  const [criticalMessage] = useState(
    () => CRITICAL_MESSAGES[Math.floor(Math.random() * CRITICAL_MESSAGES.length)]
  );
  const prevModeRef = useRef(systemStore.getState().systemMode);
  const [activeTraceId, setActiveTraceId] = useState(traceId);
  const [activeCriticalMessage, setActiveCriticalMessage] = useState(criticalMessage);

  // Clock — local, fine to keep here
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Subscribe to store updates
  useEffect(() => {
    return systemStore.subscribe(() => {
      const state = systemStore.getState();
      setUptime(state.uptime);
      setAnomalyRoute(state.anomalyRoute);

      // Regenerate stable anomaly values only on transition into ANOMALY
      if (state.systemMode === 'ANOMALY' && prevModeRef.current !== 'ANOMALY') {
        setActiveTraceId(`ERR_${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
        setActiveCriticalMessage(
          CRITICAL_MESSAGES[Math.floor(Math.random() * CRITICAL_MESSAGES.length)]
        );
      }
      prevModeRef.current = state.systemMode;
      setSystemMode(state.systemMode);
    });
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ANOMALY MODE: Transform HUD content
  if (systemMode === 'ANOMALY') {
    return (
      <div className="fixed inset-0 pointer-events-none z-80 font-mono text-[10px] uppercase tracking-widest opacity-60">
        {/* TOP PANELS - ANOMALY STATE - ALL RED */}
        <div className="absolute top-4 left-6 space-y-1 text-red-500 anomaly-text-glow">
          <p>TRACE_ID: {activeTraceId}</p>
          <p>ROUTE: {anomalyRoute || 'UNKNOWN'}</p>
        </div>
        
        <div className="absolute top-4 right-6 text-right space-y-1 text-red-500 anomaly-text-glow">
          <p>STATUS: FAILURE</p>
          <p className="animate-pulse">ERR_CLK: {time}</p>
        </div>

        {/* BOTTOM PANELS - ANOMALY STATE - RED THEME */}
        <div className="absolute bottom-4 left-6 text-red-400">
          <p>SYSTEM: CRITICAL // TERMINAL_ACTIVE</p>
        </div>

        <div className="absolute bottom-4 right-6 text-right text-red-400">
          <p className="opacity-50 animate-pulse">... {activeCriticalMessage} ...</p>
        </div>
      </div>
    );
  }

  // NORMAL MODE: Standard HUD
  return (
    <div className="fixed inset-0 pointer-events-none z-80 font-mono text-[10px] uppercase tracking-widest text-primary opacity-60">
      {/* TOP PANELS */}
      <div className="absolute top-4 left-6 space-y-1">
        <p>SYS_VER: 1.2.0</p>
        <p>LOC: DELHI_IN</p>
      </div>
      
      <div className="absolute top-4 right-6 text-right space-y-1">
        <p>TIME: {time}</p>
        <p>UPTIME: {formatUptime(uptime)}</p>
      </div>

      {/* BOTTOM PANELS */}
      <div className="absolute bottom-4 left-6">
        <p>STATUS: ACTIVE // PHOSPHOR_AMBER</p>
      </div>

      <div className="absolute bottom-4 right-6 text-right">
        <p>MODULES: CORE, UI, DATA, GLITCH</p>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ASCIIEngine } from './ASCIIEngine';
import { systemStore } from '@/store/useSystemStore';

// ---------------------------------------------------------------------------
// StaticFallback — shown when WebGL / ASCII engine fails or safe mode is on
// ---------------------------------------------------------------------------
const StaticFallback: React.FC = () => (
  <div
    className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black/40 border border-primary/10 font-mono"
    aria-label="Visual engine disabled — safe mode active"
  >
    <div className="space-y-2 text-center">
      <p className="text-[9px] tracking-[0.5em] text-primary/30 uppercase">
        &gt; VISUAL_ENGINE_DISABLED
      </p>
      <p className="text-[11px] tracking-[0.3em] text-primary/50 uppercase">
        RUNNING IN SAFE MODE
      </p>
      <div className="pt-2 opacity-20 text-[8px] tracking-widest">
        _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// SafeModeGate — renders fallback if safeMode is active in the store
// ---------------------------------------------------------------------------
const SafeModeGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [safeMode, setSafeModeState] = React.useState(
    () => systemStore.getState().safeMode
  );

  React.useEffect(() => {
    return systemStore.subscribe(() => {
      setSafeModeState(systemStore.getState().safeMode);
    });
  }, []);

  if (safeMode) return <StaticFallback />;
  return <>{children}</>;
};

// ---------------------------------------------------------------------------
// ASCIIEngineSafe — ErrorBoundary-wrapped drop-in replacement
// ---------------------------------------------------------------------------
export const ASCIIEngineSafe: React.FC = () => (
  <SafeModeGate>
    <ErrorBoundary
      label="ASCII ENGINE"
      fallback={<StaticFallback />}
      onError={() => systemStore.setSafeMode(true)}
    >
      <ASCIIEngine />
    </ErrorBoundary>
  </SafeModeGate>
);

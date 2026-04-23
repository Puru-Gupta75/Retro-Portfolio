'use client';

/**
 * Fault-tolerant wrapper around CRTWebGLWrapper.
 * If the WebGL distortion layer crashes, we log the failure, activate safe mode,
 * and fall back to rendering children without any WebGL overlay.
 *
 * Children are passed via a render function to the ErrorBoundary so the fallback
 * always receives them — even if the boundary is restructured later.
 */

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { CRTWebGLWrapper } from './CRTWebGLWrapper';
import { logEvent } from '@/lib/systemLogger';
import { systemStore } from '@/store/useSystemStore';

const CRTFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    logEvent('CRT WEBGL LAYER FAILED → SAFE MODE', 'ERROR');
    systemStore.setSafeMode(true);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {children}
    </div>
  );
};

interface Props {
  children: React.ReactNode;
}

export const CRTWebGLWrapperSafe: React.FC<Props> = ({ children }) => (
  <ErrorBoundary
    label="CRT WEBGL"
    fallback={<CRTFallback children={children} />}
  >
    <CRTWebGLWrapper>{children}</CRTWebGLWrapper>
  </ErrorBoundary>
);

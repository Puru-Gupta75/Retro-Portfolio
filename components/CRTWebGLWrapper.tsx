'use client';

import React from 'react';
import { useSystem } from '@/context/SystemContext';

/**
 * CRTWebGLWrapper
 *
 * The previous WebGL approach rendered a shader quad with tDiffuse: null and
 * never captured DOM content into the render target, so it produced zero visual
 * effect. DOM nodes cannot be read back by a WebGL sampler without an explicit
 * DOM-to-canvas pipeline (e.g. html2canvas), which was never wired up.
 *
 * This version achieves the same CRT lens look with CSS SVG filters:
 *  - barrel distortion via feDisplacementMap
 *  - chromatic aberration via layered feColorMatrix channel splits
 *  - the filter is applied to the wrapper div so it affects real DOM content
 */

export const CRTWebGLWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { crtEnabled, actualPerformance, device } = useSystem();

  // Mobile: skip all effects
  if (device === 'mobile') {
    return (
      <div className="relative w-screen h-screen overflow-hidden">
        {children}
      </div>
    );
  }

  const isLowPerf = actualPerformance === 'low';
  
  // Balanced "middle" settings for high performance
  const distortionScale = isLowPerf ? 0.5 : (device === 'tablet' ? 1.5 : 1.8);
  const abberationOffset = isLowPerf ? 0.6 : (device === 'tablet' ? 0.8 : 1.0);
  
  const showCRT = crtEnabled;

  return (
    <>
      {showCRT && (
        <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
          <defs>
            <filter id="crt-lens" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
              {/* 1. Subtle Barrel Distortion */}
              <feTurbulence type="fractalNoise" baseFrequency="0.005 0.005" numOctaves="1" result="noise" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={distortionScale}
                xChannelSelector="R"
                yChannelSelector="G"
                result="displaced"
              />

              {/* 2. Chromatic Aberration — proper channel splitting via feOffset */}
              <feColorMatrix
                in="displaced"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="red_chan"
              />
              <feColorMatrix
                in="displaced"
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="green_chan"
              />
              <feColorMatrix
                in="displaced"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                result="blue_chan"
              />

              <feOffset in="red_chan" dx={abberationOffset} dy="0" result="red_shifted" />
              <feOffset in="blue_chan" dx={-abberationOffset} dy="0" result="blue_shifted" />

              <feBlend in="red_shifted" in2="green_chan" mode="screen" result="rg" />
              <feBlend in="rg" in2="blue_shifted" mode="screen" />
            </filter>
          </defs>
        </svg>
      )}

      <div
        className="relative w-screen h-screen overflow-hidden"
        style={showCRT ? { filter: 'url(#crt-lens)' } : undefined}
      >
        {children}
      </div>
    </>
  );
};

export default CRTWebGLWrapper;

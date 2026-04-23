import React from 'react';

interface CRTWrapperProps {
  children: React.ReactNode;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export const CRTWrapper: React.FC<CRTWrapperProps> = ({ children, scrollRef }) => {
  return (
    <div className="crt-frame">
      <div className="crt-screen transition-transform duration-700">

        {/* 1. Content Layer — this is the scroll container */}
        <div className="crt-content" ref={scrollRef}>
          {children}
        </div>

        {/* 2. Phosphor Glow */}
        <div className="crt-phosphor-glow" />

        {/* 3. Curvature */}
        <div className="crt-curvature" />

        {/* 4. Scanlines */}
        <div className="crt-scanlines" />

        {/* 5. Flicker */}
        <div className="crt-flicker" />

        {/* 6. Vignette */}
        <div className="crt-vignette" />

        {/* 7. Glass Reflection */}
        <div className="crt-reflection" />

      </div>
    </div>
  );
};

export default CRTWrapper;

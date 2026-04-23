'use client';

import type { LabModule } from '@/lib/useSiteConfig';
import { SentimentNode, FluxVisualizer, KernelStress } from './LabModules';
import { useEffect, useRef } from 'react';

interface LabViewerProps {
  module: LabModule | null;
}

export const LabViewer: React.FC<LabViewerProps> = ({ module }) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when a module is loaded
  useEffect(() => {
    if (module) {
      const timer = setTimeout(() => {
        viewerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [module]);

  if (!module) {
    return (
      <div className="h-full flex flex-col items-center justify-center border border-primary/5 bg-surface/10 p-12 text-center space-y-4">
        <div className="text-4xl opacity-10 animate-pulse font-mono tracking-tighter select-none">
          NO_MODULE_LOADED
        </div>
        <p className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">Select an experiment from the grid to initialize the interface.</p>
      </div>
    );
  }

  const renderModule = () => {
    switch (module.id) {
      case 'LAB-01': return <SentimentNode />;
      case 'LAB-02': return <FluxVisualizer />;
      case 'LAB-03': return <KernelStress />;
      default: return <div className="text-primary font-mono text-xs italic">Loading module core...</div>;
    }
  };

  return (
    <div ref={viewerRef} className="space-y-8 animate-in fade-in zoom-in-95 anim-duration-500 relative">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-primary/20 pb-4 gap-4">
        <div className="space-y-1">
          <p className="text-[9px] font-mono opacity-40 uppercase tracking-[0.4em]">Active Module</p>
          <h2 className="text-2xl md:text-3xl font-space font-bold tracking-tighter text-glow uppercase leading-none">
            &gt; {module.name}
          </h2>
        </div>
        <div className="text-[10px] font-mono text-primary/60 shrink-0">
           ID: {module.id} // SEC_LVL: 4
        </div>
      </header>

      <div className="bg-surface/20 border border-primary/5 p-6 sm:p-10">
        {renderModule()}
      </div>

      <footer className="pt-4 flex flex-col gap-2">
         <div className="h-1 bg-primary/10 relative overflow-hidden">
             <div className="absolute inset-0 bg-primary/40 animate-pulse w-full translate-x-[-30%]" />
         </div>
         <p className="text-[9px] font-mono opacity-20 uppercase tracking-[0.3em] flex justify-between">
           <span>Interface Stability: Optimum</span>
           <span>Allocated_Mem: 1.2GB</span>
         </p>
      </footer>
    </div>
  );
};

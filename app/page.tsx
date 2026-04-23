import { HeroCore } from '@/components/HeroCore';
import { ActivityFeed } from '@/components/ActivityFeed';
import { QuickNav } from '@/components/QuickNav';
import { SystemSummary } from '@/components/SystemSummary';
import { ASCIIEngineSafe } from '@/components/ASCIIEngineSafe';

export default function Home() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 anim-duration-1000">
      {/* 1. HERO CORE - Identity & Presence */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <div className="xl:col-span-2">
          <HeroCore />
        </div>
        <div className="h-[300px] border border-primary/10 bg-surface/5 relative group overflow-hidden">
          <ASCIIEngineSafe />
          <div className="absolute inset-0 pointer-events-none border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 2. ACTIVITY FEED - Live System Logs */}
        <section className="order-2 lg:order-1">
          <ActivityFeed />
        </section>

        {/* 3. QUICK NAVIGATION - Direct Access */}
        <section className="order-1 lg:order-2">
          <QuickNav />
        </section>
      </div>

      {/* 4. SYSTEM SUMMARY - Hardware Snapshot */}
      <section className="pt-8 border-t border-primary/10">
        <SystemSummary />
      </section>

      {/* FOOTER METADATA */}
      <div className="pt-8 opacity-20 font-mono text-[9px] text-center uppercase tracking-[0.4em]">
        _ _ _ TERMINAL_SESSION_ACTIVE // ROOT_ENVIRONMENT_READY _ _ _
      </div>
    </div>
  );
}

import { IdentityPanel } from '@/components/IdentityPanel';
import { SkillTree } from '@/components/SkillTree';
import { ExperienceLog } from '@/components/ExperienceLog';
import { EducationBlock } from '@/components/EducationBlock';
import { Achievements } from '@/components/Achievements';

export default function ProfilePage() {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 anim-duration-1000">
      {/* 1. HEADER SECTION */}
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-space font-bold tracking-[-0.04em] uppercase text-glow">
          &gt; PROFILE
        </h1>
        <p className="font-mono text-sm leading-relaxed opacity-80 max-w-2xl">
          BIOMETRIC AND PROFESSIONAL PROFILE // SYSTEM_CORE_DATA
        </p>
      </header>

      {/* 2. IDENTITY SYSTEM */}
      <section>
        <IdentityPanel />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24">
        {/* 3. CORE ARCHITECTURE (Skills & Experience) */}
        <div className="lg:col-span-3 space-y-24">
          <section>
            <SkillTree />
          </section>
          
          <section>
            <ExperienceLog />
          </section>
        </div>

        {/* 4. FOUNDATION & REGISTRY (Education & Achievements) */}
        <div className="lg:col-span-2 space-y-24">
          <section>
            <EducationBlock />
          </section>

          <section>
            <Achievements />
          </section>

          {/* PERSISTENT STATUS PANEL */}
          <div className="bg-surface/30 p-8 border border-primary/10 font-mono space-y-4 text-[10px]">
             <h4 className="text-primary font-bold uppercase opacity-60">:: MODULE_AVAILABILITY</h4>
             <div className="space-y-1">
                <div className="flex justify-between">
                   <span className="opacity-40">HIRE_CONTRACT</span>
                   <span className="text-green-500">[ READY ]</span>
                </div>
                <div className="flex justify-between">
                   <span className="opacity-40">MNET_ACCESS</span>
                   <span className="text-green-500">[ ACTIVE ]</span>
                </div>
                <div className="flex justify-between border-t border-primary/5 pt-2 mt-2">
                   <span className="opacity-40">KERNEL_VER</span>
                   <span>1.2.0_STABLE</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* SYSTEM META */}
      <footer className="pt-24 opacity-10 font-mono text-[9px] text-center uppercase tracking-[0.4em]">
        _ _ _ HUMAN_INTERFACE_SYSTEM_HANDSHAKE_COMPLETE // SYNC_SUCCESS _ _ _
      </footer>
    </div>
  );
}

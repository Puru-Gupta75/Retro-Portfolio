'use client';

import React, { useState } from 'react';
import { TerminalForm, TerminalFormData } from '@/components/TerminalForm';
import { StatusConsole } from '@/components/StatusConsole';
import { QuickCommands } from '@/components/QuickCommands';
import { useSiteConfig } from '@/lib/useSiteConfig';

export default function UplinkPage() {
  const { config } = useSiteConfig();
  const uplinkDesc = config?.identity?.pageContent?.uplink?.description
    ?? 'EXTERNAL COMMUNICATION CHANNELS :: ESTABLISHING SECURE DATA HANDSHAKE.';
  const statusMsgs = config?.uplink?.statusMsgs ?? [
    '[INIT] HANDSHAKE_ESTABLISHED... OK',
    '[DATA] PACKET_STAGING_COMPLETE',
    '[SEC] ENCRYPTING_VIA_AES_256',
    '[NET] UPLOADING_TO_ORBITAL_NODE',
    '[OK] TRANSMISSION_COMMITTED',
  ];
  const errors = config?.uplink?.errors ?? [
    'ERR_VOID: PACKET_CONTENT_EMPTY',
    'ERR_AUTH: HANDSHAKE_TIMEOUT',
    'ERR_NET: UPLINK_INTERRUPTED_BY_PEER',
  ];

  const [logs, setLogs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTransmit = async (data: TerminalFormData) => {
    setIsSubmitting(true);
    setLogs(['[INIT] PREPARING_UPLINK_BUFFER...']);

    // Animate status messages while sending
    for (let i = 0; i < statusMsgs.length - 1; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setLogs((prev) => [...prev, statusMsgs[i]]);
    }

    try {
      const res = await fetch('/api/uplink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Transmission failed');

      setLogs((prev) => [
        ...prev,
        '[OK] TRANSMISSION_PROTOCOL_SUCCESS',
        '[FINAL] PACKET_ID: ' + Math.random().toString(36).substring(7).toUpperCase(),
      ]);
    } catch {
      setLogs((prev) => [
        ...prev,
        errors[Math.floor(Math.random() * errors.length)],
        '[RETRY] PLEASE_REINIT_UPLINK',
      ]);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 anim-duration-1000">
      {/* 1. HEADER */}
      <header className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-space font-bold tracking-[-0.04em] uppercase text-glow">
          &gt; UPLINK
        </h1>
        <p className="font-mono text-sm leading-relaxed opacity-80 max-w-2xl">
          {uplinkDesc}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* 2. TERMINAL FORM */}
        <section className="order-2 lg:order-1">
          <TerminalForm onSubmit={handleTransmit} isSubmitting={isSubmitting} />
        </section>

        {/* 3. CONSOLE & COMMANDS */}
        <div className="order-1 lg:order-2 space-y-12">
          <StatusConsole logs={logs} />

          <section className="pt-8 border-t border-primary/10">
            <QuickCommands />
          </section>
        </div>
      </div>

      {/* FOOTER METADATA */}
      <div className="pt-16 border-t border-primary/5 opacity-10 font-mono text-[9px] text-center uppercase tracking-[0.4em]">
        _ _ _ SECURE_LINE_NOMINAL // ENCRYPTION_ACTIVE // 2048_BIT_KEY _ _ _
      </div>
    </div>
  );
}

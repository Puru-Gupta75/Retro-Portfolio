import { useState, useEffect, useCallback, useRef } from 'react';

const BOOT_LOGS = [
  "[INIT] Master Boot Record found at 0x8000",
  "[OK] CPU Initialization: Amber-Core v4.2 @ 7.8GHz",
  "[OK] Hardware Abstraction Layer (HAL) loaded",
  "[OK] Memory Check: 131072MB RAM [PASSED]",
  "[INIT] Mounting /dev/nvme0n1p1 to /root",
  "[LOAD] Initializing Kernel Modules...",
  "[LOAD] Loading crypto_aes_ni... [OK]",
  "[LOAD] Loading net_driver_v4... [OK]",
  "[SECURE] Entropy pool initialized: 4096 bits",
  "[INIT] Starting AI Core: AMBER_V0.9.1",
  "[OK] Neural Engine Synapse handshake complete",
  "LOADING_KERNEL: [████████░░] 80%",
  "[LOAD] Syncing local environment profile...",
  "[OK] IDENTITY: USER_ROOT verified via biometric hash",
  "[INIT] Project Scan: Detecting local repositories...",
  "[OK] Found 42 legacy projects in /var/www/archive",
  "[OK] Found 12 active modules in /current/active",
  "SCANNING_MODULES: [██████████] 100%",
  "[INIT] Establishing encrypted tunnel to Delhi_IN node...",
  "[OK] Tunnel established: AES-256-GCM",
  "[LOAD] Initializing CRT Rendering Engine...",
  "[OK] Phosphor glow frequency synchronized.",
  "[SECURE] System integrity check [SUCCESS]",
  "[INIT] Authorization level: LEVEL_4 (ADMIN)",
  "[INIT] Finalizing Handshake...",
  "ACCESS_GRANTED: 0x0FE42A",
  "LAUNCHING_INTERFACE...",
];

export const useBootSequence = (onComplete: () => void) => {
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const [isSkipping, setIsSkipping] = useState(false);
  const [bootComplete, setBootComplete] = useState(false);

  // Use a ref for the index so the timer callback always sees the latest value
  // without needing to be re-created (avoids stale closure / double-fire bug)
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setBootComplete(true);
    setTimeout(() => onCompleteRef.current(), 1400);
  }, []);

  const scheduleNext = useCallback(() => {
    if (doneRef.current) return;

    if (indexRef.current >= BOOT_LOGS.length) {
      finish();
      return;
    }

    const line = BOOT_LOGS[indexRef.current];

    // Dramatic pauses on key lines
    let delay = Math.random() * 120 + 80; // base: 80–200ms
    if (line.includes('LOADING_KERNEL') || line.includes('SCANNING_MODULES')) delay = 600;
    if (line.includes('ACCESS_GRANTED')) delay = 900;
    if (line.includes('LAUNCHING')) delay = 700;
    if (line.includes('[SECURE]')) delay = 350;
    if (line.includes('Finalizing')) delay = 500;

    timerRef.current = setTimeout(() => {
      if (doneRef.current) return;
      indexRef.current += 1;
      setDisplayedLogs((prev) => [...prev, line]);
      scheduleNext();
    }, delay);
  }, [finish]);

  const skipBoot = useCallback(() => {
    if (doneRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSkipping(true);
    setDisplayedLogs(BOOT_LOGS);
    finish();
  }, [finish]);

  // Start the sequence once on mount
  useEffect(() => {
    timerRef.current = setTimeout(scheduleNext, 400);

    const handleInterrupt = () => skipBoot();
    window.addEventListener('keydown', handleInterrupt);
    window.addEventListener('mousedown', handleInterrupt);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('keydown', handleInterrupt);
      window.removeEventListener('mousedown', handleInterrupt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — scheduleNext is stable via useCallback+refs and must only fire once on mount

  return { displayedLogs, isSkipping, bootComplete };
};

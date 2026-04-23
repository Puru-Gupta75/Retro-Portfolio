'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { systemStore } from '@/store/useSystemStore';
import { logEvent } from '@/lib/systemLogger';
import { useDeviceType } from '@/hooks/useDeviceType';

export default function NotFound() {
  const pathname = usePathname();
  const deviceType = useDeviceType();

  useEffect(() => {
    // Only trigger anomaly if we are in normal system mode
    // This prevents re-triggering during the transition from BOOT to NORMAL
    const { systemMode } = systemStore.getState();
    if (systemMode === 'NORMAL') {
      // Log the 404 error
      logEvent(`404 ERROR → INVALID ROUTE → ${pathname}`, 'ERROR');
      
      // Trigger ANOMALY mode
      systemStore.setSystemMode('ANOMALY', pathname);
    }
  }, [pathname, deviceType]);

  // This component renders nothing - the AppShell handles the UI transformation
  return null;
}

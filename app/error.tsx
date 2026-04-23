'use client';

/**
 * Next.js route-level error boundary.
 * Rendered when an unhandled error is thrown inside a route segment.
 * Must be a Client Component.
 */

import { useEffect } from 'react';
import { SystemFallback } from '@/components/ErrorBoundary';
import { logEvent } from '@/lib/systemLogger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RouteError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logEvent(`ROUTE ERROR: ${error.message}`, 'ERROR');
    if (error.digest) {
      logEvent(`DIGEST: ${error.digest}`, 'ERROR');
    }
  }, [error]);

  return (
    <SystemFallback
      message={error.message}
      onRetry={reset}
    />
  );
}

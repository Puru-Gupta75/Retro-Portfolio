'use client';

import React from 'react';
import { logEvent } from '@/lib/systemLogger';
import { systemStore } from '@/store/useSystemStore';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /** Label used in log messages, e.g. "ASCII ENGINE" */
  label?: string;
  /** Called after an error is caught, before rendering the fallback */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * Generic React Error Boundary.
 * Catches render/lifecycle errors, logs them to the system store,
 * and renders a fallback instead of crashing the whole tree.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const label = this.props.label ?? 'COMPONENT';
    // SSR guard — logEvent already guards, but be explicit here
    if (typeof window !== 'undefined') {
      logEvent(`ERROR [${label}]: ${error.message}`, 'ERROR');
      if (info.componentStack) {
        // Log a trimmed stack so the log panel stays readable
        const firstLine = info.componentStack.trim().split('\n')[0];
        logEvent(`STACK: ${firstLine}`, 'ERROR');
      }
    }
    this.props.onError?.(error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <SystemFallback
          message={this.state.errorMessage}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// SystemFallback — full-page crash screen
// ---------------------------------------------------------------------------

interface FallbackProps {
  message?: string;
  onRetry?: () => void;
}

export const SystemFallback: React.FC<FallbackProps> = ({ message, onRetry }) => {
  const handleReload = () => window.location.reload();
  const handleHome = () => { window.location.href = '/'; };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-black font-mono"
      role="alert"
      aria-live="assertive"
    >
      <div className="border border-red-500/40 bg-red-950/10 p-10 max-w-lg w-full space-y-6 text-center">
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[9px] tracking-[0.5em] text-red-400/60 uppercase">
            &gt; SYSTEM_ERROR _
          </p>
          <h1 className="text-2xl font-bold text-red-400 tracking-widest uppercase">
            RUNTIME FAILURE DETECTED
          </h1>
          <p className="text-[10px] text-red-400/50 uppercase tracking-widest">
            [ACTION REQUIRED]
          </p>
        </div>

        {/* Error detail */}
        {message && (
          <div className="bg-red-950/20 border border-red-500/20 p-3 text-left">
            <p className="text-[10px] text-red-400/70 wrap-break-word leading-relaxed">
              {message}
            </p>
          </div>
        )}

        {/* Decorative scan line */}
        <div className="h-px w-full bg-red-500/20" />

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="border border-primary/40 text-primary/80 text-[10px] tracking-[0.3em] uppercase px-4 py-2 hover:bg-primary/10 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              [RETRY]
            </button>
          )}
          <button
            onClick={handleReload}
            className="border border-red-500/40 text-red-400/80 text-[10px] tracking-[0.3em] uppercase px-4 py-2 hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500/40"
          >
            [RELOAD SYSTEM]
          </button>
          <button
            onClick={handleHome}
            className="border border-primary/20 text-primary/50 text-[10px] tracking-[0.3em] uppercase px-4 py-2 hover:bg-primary/5 transition-colors focus:outline-none focus:ring-1 focus:ring-primary/20"
          >
            [RETURN HOME]
          </button>
        </div>
      </div>
    </div>
  );
};

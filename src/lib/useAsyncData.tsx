'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { withTimeout, TimeoutError } from './safeguards';

// ─── useAsyncData ─────────────────────────────────────────────────────────────
// Universal data fetching hook with loading/error/retry states.
// Replaces ad-hoc useEffect + useState patterns across all pages.
//
// Usage:
//   const { data, loading, error, retry } = useAsyncData(() =>
//     supabase.from('vault_entries').select('*').eq('user_id', userId)
//   );

export interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useAsyncData<T>(
  fetcher: () => Promise<{ data: T | null; error: unknown }>,
  deps: unknown[] = [],
  opts: { timeoutMs?: number; enabled?: boolean } = {},
): AsyncDataState<T> {
  const { timeoutMs = 12_000, enabled = true } = opts;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      const result = await withTimeout(Promise.resolve(fetcher()), timeoutMs);
      if (result.error) {
        setError(formatError(result.error));
        setData(null);
      } else {
        setData(result.data);
      }
    } catch (err) {
      if (err instanceof TimeoutError) {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError(formatError(err));
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, retryCountRef]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    retryCountRef.current += 1;
    load();
  }, [load]);

  return { data, loading, error, retry };
}

// ─── LoadingState ─────────────────────────────────────────────────────────────
// Consistent skeleton/spinner component used across all pages.

import React from 'react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-4 ${className}`}>
      <div className="w-8 h-8 rounded-full border border-[#B89B5E]/30 border-t-[#B89B5E] animate-spin" />
      <p className="text-[#F5F3EF]/40 text-sm font-['DM_Sans']">{message}</p>
    </div>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className = '' }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-4 ${className}`}>
      <div className="w-10 h-10 rounded-full border border-red-500/30 flex items-center justify-center">
        <span className="text-red-400 text-sm">!</span>
      </div>
      <p className="text-[#F5F3EF]/50 text-sm font-['DM_Sans'] text-center max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2 border border-[#B89B5E]/30 text-[#B89B5E] text-sm font-['DM_Sans'] rounded-lg hover:bg-[#B89B5E]/10 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}>
      <div className="w-10 h-10 rounded-full border border-[#B89B5E]/20 flex items-center justify-center">
        <span className="text-[#B89B5E]/40 text-lg">◦</span>
      </div>
      <p className="text-[#F5F3EF]/70 text-sm font-['DM_Sans'] font-medium">{title}</p>
      {description && (
        <p className="text-[#F5F3EF]/30 text-xs font-['DM_Sans'] text-center max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-5 py-2 border border-[#B89B5E]/30 text-[#B89B5E] text-sm font-['DM_Sans'] rounded-lg hover:bg-[#B89B5E]/10 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatError(err: unknown): string {
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return 'An unexpected error occurred.';
}

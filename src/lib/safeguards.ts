// ─── withRetry ────────────────────────────────────────────────────────────────
// Wraps any async function and retries it up to `maxAttempts` times with
// exponential backoff. Useful for Supabase saves, API calls, etc.

export interface RetryOptions {
  maxAttempts?: number;      // default 3
  initialDelayMs?: number;   // default 500
  backoffFactor?: number;    // default 2
  onAttempt?: (attempt: number) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 500,
    backoffFactor = 2,
    onAttempt,
  } = opts;

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      onAttempt?.(attempt);
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await sleep(delay);
        delay *= backoffFactor;
      }
    }
  }

  throw lastError;
}

// ─── withTimeout ──────────────────────────────────────────────────────────────
// Races a promise against a timeout. Throws a TimeoutError if it loses.

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Operation timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export async function withTimeout<T>(promise: Promise<T>, ms = 15_000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

// ─── safeSupabase ─────────────────────────────────────────────────────────────
// Wraps a Supabase query with timeout + retry. Returns { data, error }.
// Usage:
//   const { data, error } = await safeSupabase(() =>
//     supabase.from('vault_entries').select('*')
//   );

export async function safeSupabase<T>(
  fn: () => PromiseLike<{ data: T | null; error: unknown }>,
  opts: RetryOptions & { timeoutMs?: number } = {},
): Promise<{ data: T | null; error: unknown }> {
  const { timeoutMs = 12_000, ...retryOpts } = opts;

  try {
    return await withRetry(
      () => withTimeout(Promise.resolve(fn()), timeoutMs),
      retryOpts,
    );
  } catch (err) {
    return { data: null, error: err };
  }
}

// ─── atomicVaultSave ──────────────────────────────────────────────────────────
// Saves a vault entry + optional file upload atomically.
// If the file upload fails, the entry row is deleted (rollback).
// If the row save fails, no file is uploaded.
//
// Usage:
//   const result = await atomicVaultSave({
//     saveEntry: () => supabase.from('vault_entries').insert(payload).select().single(),
//     uploadFile: file ? () => supabase.storage.from('vault-media').upload(path, file) : undefined,
//     onProgress: setProgress,
//   });

export interface AtomicSaveOptions<TEntry> {
  saveEntry: () => Promise<{ data: TEntry | null; error: unknown }>;
  uploadFile?: (entryId: string) => Promise<{ data: unknown; error: unknown }>;
  deleteEntry?: (entryId: string) => Promise<unknown>;
  onProgress?: (pct: number) => void;
  timeoutMs?: number;
}

export interface AtomicSaveResult<TEntry> {
  success: boolean;
  entry: TEntry | null;
  error: string | null;
  phase: 'entry' | 'upload' | 'done';
}

export async function atomicVaultSave<TEntry extends { id: string }>(
  opts: AtomicSaveOptions<TEntry>,
): Promise<AtomicSaveResult<TEntry>> {
  const { saveEntry, uploadFile, deleteEntry, onProgress, timeoutMs = 15_000 } = opts;

  // Phase 1: Save entry row
  onProgress?.(10);
  const { data: entry, error: entryError } = await withTimeout(
    Promise.resolve(saveEntry()),
    timeoutMs,
  ).catch((err) => ({ data: null, error: err }));

  if (entryError || !entry) {
    return {
      success: false,
      entry: null,
      error: formatError(entryError) ?? 'Failed to save entry.',
      phase: 'entry',
    };
  }

  onProgress?.(40);

  // Phase 2: Upload file (if provided)
  if (uploadFile) {
    const { error: uploadError } = await withTimeout(
      Promise.resolve(uploadFile(entry.id)),
      timeoutMs,
    ).catch((err) => ({ data: null, error: err }));

    if (uploadError) {
      // Rollback: delete the entry row
      if (deleteEntry) {
        await deleteEntry(entry.id).catch(console.error);
      }
      return {
        success: false,
        entry: null,
        error: formatError(uploadError) ?? 'File upload failed. Entry was not saved.',
        phase: 'upload',
      };
    }

    onProgress?.(90);
  }

  onProgress?.(100);
  return { success: true, entry, error: null, phase: 'done' };
}

// ─── Null guards ──────────────────────────────────────────────────────────────

/** Returns value if defined & non-null, otherwise the fallback. */
export function coalesce<T>(value: T | null | undefined, fallback: T): T {
  return value == null ? fallback : value;
}

/** Safely accesses a deeply nested property without throwing. */
export function safeGet<T>(
  obj: Record<string, unknown>,
  path: string,
  fallback: T,
): T {
  try {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return fallback;
      current = (current as Record<string, unknown>)[part];
    }
    return (current as T) ?? fallback;
  } catch {
    return fallback;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatError(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return 'An unexpected error occurred.';
}

export { formatError };

/**
 * Keeps a broken dependency from turning into hundreds of Slack messages.
 *
 * Two independent brakes:
 *  - per-fingerprint dedupe, so the *same* failure is posted at most once per window
 *  - a global ceiling per window, so a broad outage across many endpoints still cannot
 *    flood the channel
 *
 * Time is passed in rather than read from a clock inside, and no timers are scheduled,
 * so nothing here keeps the process alive and tests stay deterministic.
 */

interface ThrottleOptions {
  dedupeWindowMs: number;
  maxReportsPerWindow: number;
}

export interface ThrottleVerdict {
  /** Whether anything at all should be posted. */
  allowed: boolean;
  /** Identical errors swallowed since this fingerprint was last posted. */
  suppressedSinceLast: number;
  /** The global ceiling was just reached — post the short notice, not the full report. */
  rateLimitReached: boolean;
}

interface FingerprintEntry {
  lastSentAt: number;
  suppressed: number;
}

// Backstop against unbounded growth if an app produces endlessly varying fingerprints.
const MAX_TRACKED_FINGERPRINTS = 500;

const suppressedVerdict = (): ThrottleVerdict => ({ allowed: false, suppressedSinceLast: 0, rateLimitReached: false });

export interface Throttle {
  evaluate: (fingerprint: string, now: number) => ThrottleVerdict;
}

export const createThrottle = ({ dedupeWindowMs, maxReportsPerWindow }: ThrottleOptions): Throttle => {
  const entries = new Map<string, FingerprintEntry>();
  let windowStartedAt = 0;
  let sentInWindow = 0;
  let capNoticeSent = false;

  // Drop entries that are past their window and have nothing left to report. Entries
  // still carrying a suppressed count are kept so the next occurrence can mention them.
  const prune = (now: number) => {
    for (const [fingerprint, entry] of entries) {
      if (entry.suppressed === 0 && now - entry.lastSentAt > dedupeWindowMs) {
        entries.delete(fingerprint);
      }
    }
    while (entries.size > MAX_TRACKED_FINGERPRINTS) {
      const [oldestFingerprint] = [...entries.entries()].reduce((oldest, candidate) =>
        oldest[1].lastSentAt <= candidate[1].lastSentAt ? oldest : candidate,
      );
      entries.delete(oldestFingerprint);
    }
  };

  const startNewWindowIfElapsed = (now: number) => {
    if (now - windowStartedAt >= dedupeWindowMs) {
      windowStartedAt = now;
      sentInWindow = 0;
      capNoticeSent = false;
    }
  };

  const evaluate = (fingerprint: string, now: number): ThrottleVerdict => {
    prune(now);
    startNewWindowIfElapsed(now);

    const entry = entries.get(fingerprint);

    // Dedupe runs before the global ceiling so a single noisy error cannot spend the
    // whole budget and hide unrelated failures.
    if (entry && now - entry.lastSentAt < dedupeWindowMs) {
      entry.suppressed += 1;
      return suppressedVerdict();
    }

    if (sentInWindow >= maxReportsPerWindow) {
      if (entry) {
        entry.suppressed += 1;
      }
      if (capNoticeSent) {
        return suppressedVerdict();
      }
      // Announce the ceiling once, then stay quiet until the window resets. The entry is
      // intentionally left untouched so the real error is still reportable next window.
      capNoticeSent = true;
      return { allowed: true, suppressedSinceLast: 0, rateLimitReached: true };
    }

    const suppressedSinceLast = entry?.suppressed ?? 0;
    entries.set(fingerprint, { lastSentAt: now, suppressed: 0 });
    sentInWindow += 1;
    return { allowed: true, suppressedSinceLast, rateLimitReached: false };
  };

  return { evaluate };
};

/**
 * Collapses variable path segments so `/api/cases/123` and `/api/cases/456` share one
 * fingerprint. Runs on the already-redacted path, hence the masked-value placeholders.
 */
const VARIABLE_SEGMENT = /^(?:\d+|\[[a-zåäö]+\]|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

const normalizePath = (path: string): string =>
  path
    .split('/')
    .map(segment => (VARIABLE_SEGMENT.test(segment) ? ':id' : segment))
    .join('/');

/** Identity of an error for dedupe purposes: what broke, where, and with which status. */
export const fingerprintOf = (status: number, message: string, path?: string): string => `${status}|${normalizePath(path ?? '')}|${message}`;

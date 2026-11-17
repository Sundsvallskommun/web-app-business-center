import { redact, redactCorrelationId } from './redact';
import { buildErrorMessage, buildRateLimitMessage, postToSlack } from './slack-transport';
import { createThrottle, fingerprintOf, Throttle } from './throttle';
import { ErrorReport, ErrorReporterConfig, ResolvedErrorReporterConfig } from './types';

export type { ErrorReport, ErrorReporterConfig, ErrorReporterLogger } from './types';

/**
 * Generic error reporting to a Slack channel.
 *
 * Drop this folder into any Node backend, call `initErrorReporter()` once at startup and
 * `reportError()` from wherever errors are already handled. See README.md.
 *
 * Three guarantees the rest of the app depends on:
 *  1. It never throws — a broken webhook must not break error handling.
 *  2. It never blocks — delivery is fire-and-forget with a timeout.
 *  3. It is inert until configured with a webhook URL.
 */

const DEFAULT_MIN_STATUS = 400;
const DEFAULT_DEDUPE_WINDOW_MS = 5 * 60_000;
const DEFAULT_MAX_REPORTS_PER_WINDOW = 20;
const DEFAULT_TIMEOUT_MS = 3_000;

interface ReporterState {
  config: ResolvedErrorReporterConfig;
  throttle: Throttle;
}

let state: ReporterState | null = null;

const isHttpUrl = (value: string): boolean => value.startsWith('http://') || value.startsWith('https://');

const resolveWebhookUrl = (config: ErrorReporterConfig): string => {
  const webhookUrl = (config.webhookUrl ?? '').trim();
  if (!webhookUrl) {
    return '';
  }
  if (!isHttpUrl(webhookUrl)) {
    // Loud rather than silent: a typo here would otherwise mean no alerts and no clue why.
    config.logger?.warn('SLACK_WEBHOOK_URL är satt men är ingen http(s)-URL — felnotiser till Slack är avstängda.');
    return '';
  }
  return webhookUrl;
};

/** Applies configuration. Safe to call again; the later call wins and throttling resets. */
export const initErrorReporter = (config: ErrorReporterConfig): void => {
  const resolved: ResolvedErrorReporterConfig = {
    webhookUrl: resolveWebhookUrl(config),
    appName: config.appName,
    environment: config.environment,
    minStatus: config.minStatus ?? DEFAULT_MIN_STATUS,
    ignoreStatuses: config.ignoreStatuses ?? [],
    // Lower-cased once here so the per-error check stays a plain substring test.
    ignoreMessages: (config.ignoreMessages ?? []).map(pattern => pattern.toLowerCase()),
    dedupeWindowMs: config.dedupeWindowMs ?? DEFAULT_DEDUPE_WINDOW_MS,
    maxReportsPerWindow: config.maxReportsPerWindow ?? DEFAULT_MAX_REPORTS_PER_WINDOW,
    timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    logger: config.logger,
  };

  state = {
    config: resolved,
    throttle: createThrottle({ dedupeWindowMs: resolved.dedupeWindowMs, maxReportsPerWindow: resolved.maxReportsPerWindow }),
  };
};

/** True when a usable webhook is configured. Handy for health endpoints and tests. */
export const isErrorReporterEnabled = (): boolean => state !== null && state.config.webhookUrl !== '';

/** Clears all configuration and throttling state. Intended for tests. */
export const resetErrorReporter = (): void => {
  state = null;
};

/**
 * Strips personal data at the boundary, so neither the outgoing message nor the in-memory
 * dedupe fingerprints ever hold an identifier. Truncation and escaping happen later, in
 * the transport, where the presentation limits live.
 */
const redactReport = (report: ErrorReport): ErrorReport => ({
  ...report,
  message: redact(report.message),
  path: report.path === undefined ? undefined : redact(report.path),
  requestId: report.requestId === undefined ? undefined : redactCorrelationId(report.requestId),
  validationErrors: report.validationErrors === undefined ? undefined : redact(report.validationErrors),
  stack: report.stack === undefined ? undefined : redact(report.stack),
  details:
    report.details === undefined ? undefined : Object.fromEntries(Object.entries(report.details).map(([key, value]) => [key, redact(String(value))])),
});

/** Matched on the raw message, before redaction — masking never touches these keywords. */
const isIgnoredMessage = (message: string, ignoreMessages: string[]): boolean => {
  if (ignoreMessages.length === 0) {
    return false;
  }
  const lowerCased = message.toLowerCase();
  return ignoreMessages.some(pattern => lowerCased.includes(pattern));
};

/**
 * Reports one error. Returns immediately; delivery happens in the background.
 *
 * Skipped when: not initialised, no webhook configured, the status is below `minStatus`,
 * the status is on the ignore list, the message matches an ignore pattern, or the throttle
 * has already reported this error.
 */
export const reportError = (report: ErrorReport): void => {
  if (state === null || state.config.webhookUrl === '') {
    return;
  }
  const { config, throttle } = state;

  try {
    if (
      report.status < config.minStatus ||
      config.ignoreStatuses.includes(report.status) ||
      isIgnoredMessage(report.message, config.ignoreMessages)
    ) {
      return;
    }

    const sanitizedReport = redactReport(report);
    const at = new Date();
    const verdict = throttle.evaluate(fingerprintOf(sanitizedReport.status, sanitizedReport.message, sanitizedReport.path), at.getTime());
    if (!verdict.allowed) {
      return;
    }

    const message = verdict.rateLimitReached
      ? buildRateLimitMessage(config, at)
      : buildErrorMessage(sanitizedReport, config, { at, suppressedSinceLast: verdict.suppressedSinceLast });

    void postToSlack(message, config);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    config.logger?.error(`Felnotisen kunde inte byggas: ${reason}`);
  }
};

/**
 * Public contract for the error reporter.
 *
 * Deliberately free of app-specific types: the host application maps its own exception
 * shape onto `ErrorReport`. That is what lets this folder be dropped into another
 * backend unchanged — see README.md.
 */

export interface ErrorReporterLogger {
  warn: (message: string) => void;
  error: (message: string) => void;
}

export interface ErrorReporterConfig {
  /** Slack Incoming Webhook URL. Missing, empty or non-http disables the reporter. */
  webhookUrl?: string;
  /** Shown in the message header, e.g. 'Mina sidor företag'. */
  appName: string;
  /** Shown next to the app name, e.g. 'TEST', 'PRODUCTION', 'LOCAL'. */
  environment: string;
  /** Lowest HTTP status that is reported at all. Defaults to 400. */
  minStatus?: number;
  /** Statuses skipped even though they pass `minStatus`, e.g. [401, 404]. Defaults to none. */
  ignoreStatuses?: number[];
  /**
   * Error messages to skip, matched case-insensitively as substrings — e.g.
   * ['NOT_AUTHORIZED'] mutes an expired session without muting every 401, so a 401 caused
   * by an actual auth bug still reaches the channel. Defaults to none.
   */
  ignoreMessages?: string[];
  /** How long an identical error is suppressed after being reported. Defaults to 5 minutes. */
  dedupeWindowMs?: number;
  /** Ceiling on messages posted per dedupe window, across all errors. Defaults to 20. */
  maxReportsPerWindow?: number;
  /** Timeout for the webhook request. Defaults to 3000 ms. */
  timeoutMs?: number;
  /** Where the reporter logs its own failures. Defaults to silence. */
  logger?: ErrorReporterLogger;
}

/** Config after defaults have been applied. Internal to the module. */
export interface ResolvedErrorReporterConfig extends Required<Omit<ErrorReporterConfig, 'webhookUrl' | 'logger'>> {
  webhookUrl: string;
  logger?: ErrorReporterLogger;
}

export interface ErrorReport {
  status: number;
  message: string;
  method?: string;
  path?: string;
  requestId?: string;
  /** Serialized validation failures, when the error carries them. */
  validationErrors?: string;
  stack?: string;
  /** Free-form extras rendered as a context line, e.g. upstream url and status. */
  details?: Record<string, string | number>;
}

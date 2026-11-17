import axios from 'axios';
import { sanitize, sanitizeCorrelationId, sanitizeMultiline } from './redact';
import { ErrorReport, ResolvedErrorReporterConfig } from './types';

/**
 * Builds the Block Kit payload and posts it to a Slack Incoming Webhook.
 *
 * An Incoming Webhook is used rather than a bot token because it needs no OAuth flow and
 * stays reachable when the APIs we are reporting *about* are down.
 */

// Slack's own limits, kept well below the hard ceilings so a long value cannot get a
// message rejected: header 150, section text 3000, field text 2000.
const HEADER_MAX_LENGTH = 140;
const MESSAGE_MAX_LENGTH = 900;
const FIELD_MAX_LENGTH = 300;
const STACK_MAX_LENGTH = 1500;
const FALLBACK_MAX_LENGTH = 300;

interface SlackTextObject {
  type: 'plain_text' | 'mrkdwn';
  text: string;
  emoji?: boolean;
}

interface SlackBlock {
  type: 'header' | 'section' | 'context' | 'divider';
  text?: SlackTextObject;
  fields?: SlackTextObject[];
  elements?: SlackTextObject[];
}

interface SlackMessage {
  /** Plain-text fallback used for mobile push notifications and unfurl previews. */
  text: string;
  blocks: SlackBlock[];
}

/** Slack mrkdwn treats these three characters as markup, so user content must escape them. */
const escapeMarkdown = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Backticks in the payload would close the fence early, so they are neutralised. */
const codeBlock = (value: string): string => `\`\`\`${escapeMarkdown(value).replace(/`/g, "'")}\`\`\``;

const mrkdwn = (text: string): SlackTextObject => ({ type: 'mrkdwn', text });

const formatTimestamp = (at: Date): string =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', dateStyle: 'short', timeStyle: 'medium' }).format(at);

const severityEmoji = (status: number): string => (status >= 500 ? '🔴' : '🟠');

const formatEndpoint = (report: ErrorReport): string => {
  const endpoint = `${report.method ?? ''} ${report.path ?? ''}`.trim();
  return endpoint ? sanitize(endpoint, FIELD_MAX_LENGTH) : '–';
};

const headerBlock = (config: ResolvedErrorReporterConfig, emoji: string): SlackBlock => ({
  type: 'header',
  text: { type: 'plain_text', text: sanitize(`${emoji} ${config.appName} — ${config.environment}`, HEADER_MAX_LENGTH), emoji: true },
});

export const buildErrorMessage = (
  report: ErrorReport,
  config: ResolvedErrorReporterConfig,
  { at, suppressedSinceLast }: { at: Date; suppressedSinceLast: number },
): SlackMessage => {
  const message = sanitize(report.message, MESSAGE_MAX_LENGTH);
  const endpoint = formatEndpoint(report);

  const fields: SlackTextObject[] = [
    mrkdwn(`*Statuskod*\n\`${report.status}\``),
    mrkdwn(`*Tidpunkt*\n${formatTimestamp(at)}`),
    mrkdwn(`*Endpoint*\n\`${escapeMarkdown(endpoint)}\``),
  ];
  if (report.requestId) {
    fields.push(mrkdwn(`*Request-ID*\n\`${escapeMarkdown(sanitizeCorrelationId(report.requestId, FIELD_MAX_LENGTH))}\``));
  }

  const blocks: SlackBlock[] = [
    headerBlock(config, severityEmoji(report.status)),
    { type: 'section', fields },
    { type: 'section', text: mrkdwn(`*Felmeddelande*\n${codeBlock(message)}`) },
  ];

  if (report.validationErrors) {
    blocks.push({ type: 'section', text: mrkdwn(`*Valideringsfel*\n${codeBlock(sanitize(report.validationErrors, MESSAGE_MAX_LENGTH))}`) });
  }

  const detailEntries = Object.entries(report.details ?? {});
  if (detailEntries.length > 0) {
    const rendered = detailEntries.map(([key, value]) => `*${escapeMarkdown(key)}:* ${escapeMarkdown(sanitize(String(value), FIELD_MAX_LENGTH))}`);
    blocks.push({ type: 'context', elements: [mrkdwn(rendered.join('  ·  '))] });
  }

  if (report.stack) {
    blocks.push({ type: 'section', text: mrkdwn(`*Stack*\n${codeBlock(sanitizeMultiline(report.stack, STACK_MAX_LENGTH))}`) });
  }

  if (suppressedSinceLast > 0) {
    blocks.push({ type: 'context', elements: [mrkdwn(`_${suppressedSinceLast} likadana fel undertrycktes sedan förra notisen._`)] });
  }

  return {
    text: sanitize(
      `${severityEmoji(report.status)} ${config.appName} (${config.environment}) ${report.status} ${endpoint} – ${message}`,
      FALLBACK_MAX_LENGTH,
    ),
    blocks,
  };
};

/** Posted once when the per-window ceiling is hit, so silence is never mistaken for calm. */
export const buildRateLimitMessage = (config: ResolvedErrorReporterConfig, at: Date): SlackMessage => {
  const windowMinutes = Math.max(1, Math.round(config.dedupeWindowMs / 60_000));
  const text = `Taket på ${config.maxReportsPerWindow} felnotiser per ${windowMinutes} min är nått — fler fel inträffar men rapporteras inte förrän fönstret nollställs. Kontrollera loggarna.`;
  return {
    text: `⚠️ ${config.appName} (${config.environment}): ${text}`,
    blocks: [headerBlock(config, '⚠️'), { type: 'section', text: mrkdwn(text) }, { type: 'context', elements: [mrkdwn(formatTimestamp(at))] }],
  };
};

/** Fire-and-forget delivery. Resolves even on failure — reporting must never break the app. */
export const postToSlack = async (message: SlackMessage, config: ResolvedErrorReporterConfig): Promise<void> => {
  try {
    await axios.post(config.webhookUrl, message, { timeout: config.timeoutMs, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    config.logger?.warn(`Kunde inte skicka felnotis till Slack: ${reason}`);
  }
};

/**
 * Masks personal and secret data before an error ever leaves the process.
 *
 * This matters because personal identifiers routinely end up inside the values we
 * report: upstream URLs embed a personnummer (`/engagements/person/{personNumber}`),
 * validation messages echo user input, and stack frames can carry request payloads.
 * A Slack channel is a far less controlled place than a rotating log file, so nothing
 * identifying is allowed through.
 */

interface RedactionRule {
  pattern: RegExp;
  replacement: string;
}

// A partyId is a UUID, but so is a request id — and a request id is a random correlation
// token, not an identifier of a person. Kept separate so it can be exempted where masking
// would destroy the very traceability the notification exists to provide.
const UUID_RULE: RedactionRule = {
  pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  replacement: '[partyId]',
};

// Order matters. Secrets and structured identifiers are matched first so that the looser
// numeric patterns further down cannot chew a hole in the middle of them.
const RULES: RedactionRule[] = [
  // Secret-bearing key/value pairs in headers, query strings and JSON. This runs before the
  // standalone Bearer rule and consumes any scheme prefix itself, so that an
  // `Authorization: Bearer <token>` header is masked once rather than twice.
  {
    pattern:
      /\b(authorization|x-api-key|client_secret|client_key|access_token|refresh_token|password)(["']?\s*[:=]\s*["']?)(?:Bearer\s+|Basic\s+)?[^\s"',}&]+/gi,
    replacement: '$1$2[dolt]',
  },
  // A bearer token that appears on its own, without a header name in front of it.
  { pattern: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi, replacement: 'Bearer [dolt]' },

  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '[epost]' },

  // partyId and other UUIDs.
  UUID_RULE,

  // Swedish mobile numbers. Matched before personnummer because a bare 10-digit run
  // starting 07x is ambiguous between the two — either way the value ends up masked, and
  // in this domain it is far more often a phone number. Note the word boundary sits on the
  // `0` branch only: `\b` never holds before a leading `+`.
  { pattern: /(?:\+46[\s-]?|\b0)7[02369][\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g, replacement: '[telefon]' },

  // Personnummer, 10 or 12 digits with an optional century and separator. The month and day
  // groups are validated so this cannot swallow an organisationsnummer, whose corresponding
  // digits fall outside 01-12 / 01-31. A sole trader's orgnr *is* a personnummer and is
  // caught here regardless of formatting.
  { pattern: /\b(?:19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[-+]?\d{4}\b/g, replacement: '[personnummer]' },

  // Organisationsnummer in its unambiguous forms: dashed, or 12 digits prefixed with 16. A
  // bare 10-digit run is deliberately left alone — it collides with unix timestamps and
  // internal ids, and a company orgnr is public data anyway.
  { pattern: /\b(?:16\d{10}|\d{6}-\d{4})\b/g, replacement: '[orgnr]' },
];

/**
 * Removes CR/LF so an attacker-controlled value cannot forge extra lines in the
 * notification. Mirrors the guard already present in the Express error middleware.
 */
const stripNewlines = (value: string): string => value.replace(/[\r\n]+/g, ' ');

const applyRules = (value: string, rules: RedactionRule[]): string =>
  rules.reduce((masked, rule) => masked.replace(rule.pattern, rule.replacement), value);

/** Applies every redaction rule to a single string. */
export const redact = (value: string): string => applyRules(value, RULES);

/**
 * For values that are UUIDs by design, such as a request id. Every other rule still runs,
 * because the value comes from a client-supplied header and could carry anything.
 */
export const redactCorrelationId = (value: string): string =>
  applyRules(
    value,
    RULES.filter(rule => rule !== UUID_RULE),
  );

const truncate = (value: string, maxLength: number): string => (value.length > maxLength ? `${value.slice(0, maxLength)}…` : value);

const finishSingleLine = (redacted: string, maxLength: number): string => truncate(stripNewlines(redacted).trim(), maxLength);

/** Redacts, collapses newlines and truncates — the treatment for single-line fields. */
export const sanitize = (value: string, maxLength: number): string => finishSingleLine(redact(value), maxLength);

/** As `sanitize`, but keeps a request id intact instead of mistaking it for a partyId. */
export const sanitizeCorrelationId = (value: string, maxLength: number): string => finishSingleLine(redactCorrelationId(value), maxLength);

/** Redacts and truncates while keeping line breaks — for stack traces rendered in a code block. */
export const sanitizeMultiline = (value: string, maxLength: number): string => truncate(redact(value).trim(), maxLength);

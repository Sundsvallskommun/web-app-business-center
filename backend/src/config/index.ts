import { config } from 'dotenv';

import { APIS } from './api-config';
export { APIS };

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const SWAGGER_ENABLED = process.env.SWAGGER_ENABLED === 'true';
export const SESSION_MEMORY = process.env.SESSION_MEMORY === 'true';

// Mirrors the frontend NEXT_PUBLIC_USE_DECISIONS flag; enforced server-side.
export const USE_DECISIONS = process.env.USE_DECISIONS === 'true';

// Several settings below are comma-separated env lists; parse them the same way.
const parseCommaList = (value: string): string[] =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

// Whitelist of partyassets `type` values that may be returned to the client.
// Comma-separated env list; the backend is the single authority for this filter.
export const WHITELIST_ASSET_TYPES: ReadonlySet<string> = new Set(parseCommaList(process.env.WHITELIST_ASSET_TYPES ?? ''));

// Human-readable app name shown in Slack error reports. Deliberately not called APP_NAME:
// that is a generic name other tooling and sibling apps also set, and picking up a stray
// value would silently head every alert with the wrong application.
export const SLACK_APP_NAME = process.env.SLACK_APP_NAME || 'Mina sidor företag';

// HTTP statuses excluded from Slack error reports. Comma-separated env list, e.g. "401,404",
// so expected-but-noisy failures can be muted per environment without a code change.
export const SLACK_IGNORE_STATUSES: number[] = parseCommaList(process.env.SLACK_IGNORE_STATUSES ?? '')
  .map(Number)
  .filter(status => Number.isInteger(status) && status > 0);

// Error messages excluded from Slack error reports, matched case-insensitively as substrings.
// Defaults to the auth failures every session produces on expiry — an expired session is not
// an incident. Muting by message rather than by status keeps a 401 from an actual auth bug
// visible. Set the var to an empty string to report these too.
export const SLACK_IGNORE_MESSAGES: string[] = parseCommaList(process.env.SLACK_IGNORE_MESSAGES ?? 'NOT_AUTHORIZED,AUTH_FAILED');

export const {
  NODE_ENV,
  PORT,
  API_BASE_URL,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  SECRET_KEY,
  CLIENT_KEY,
  CLIENT_SECRET,
  BASE_URL_PREFIX,
  SAML_CALLBACK_URL,
  SAML_LOGOUT_URL,
  SAML_LOGOUT_CALLBACK_URL,
  SAML_LOGOUT_REDIRECT,
  SAML_FAILURE_REDIRECT,
  SAML_ENTRY_SSO,
  SAML_ISSUER,
  SAML_IDP_PUBLIC_CERT,
  SAML_PRIVATE_KEY,
  SAML_PUBLIC_KEY,
  FEEDBACK_EMAIL,
  MUNICIPALITY_ID,
  MUNICIPALITY_ORG_NR,
  ENVIRONMENT,
  NAMESPACE,
  GRP_URL,
  GRP_SERVICE_ID,
  GRP_ACCESS_TOKEN,
  GRP_DISPLAY_NAME,
  GRP_DEV_PERSONNUMBER,
  SLACK_WEBHOOK_URL,
} = process.env;

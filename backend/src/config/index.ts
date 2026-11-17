import { config } from 'dotenv';

import { APIS } from './api-config';
export { APIS };

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const SWAGGER_ENABLED = process.env.SWAGGER_ENABLED === 'true';
export const SESSION_MEMORY = process.env.SESSION_MEMORY === 'true';

// Namespaces every Redis key this application owns. Only needs overriding via
// REDIS_KEY_PREFIX when several applications share one Redis instance.
const DEFAULT_REDIS_KEY_PREFIX = 'web-app-business-center';

type RedisConfig = { enabled: false } | { enabled: true; host: string; keyPrefix: string; port: number; password?: string };

function parseRedisPort(value: string): number {
  const parsedPort = Number(value);

  if (!/^\d+$/.test(value) || !Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
    throw new Error('REDIS_PORT must be an integer between 1 and 65535');
  }

  return parsedPort;
}

/**
 * Redis is enabled by setting REDIS_HOST. Without it the app runs on a single instance with
 * local sessions (memory or file) and an in-memory API token.
 */
export function createRedisConfig(environment: NodeJS.ProcessEnv): RedisConfig {
  const redisHost = environment.REDIS_HOST?.trim() ?? '';
  const configuredKeyPrefix = environment.REDIS_KEY_PREFIX?.trim() ?? '';
  const redisKeyPrefix = configuredKeyPrefix === '' ? DEFAULT_REDIS_KEY_PREFIX : configuredKeyPrefix;
  const redisPort = environment.REDIS_PORT?.trim() ?? '';
  const redisPassword = environment.REDIS_PASSWORD ?? '';

  if (!redisHost) {
    if (redisPort || redisPassword) {
      throw new Error('REDIS_HOST is required when REDIS_PORT or REDIS_PASSWORD is configured');
    }

    return { enabled: false };
  }

  const connection = {
    host: redisHost,
    keyPrefix: redisKeyPrefix,
    port: parseRedisPort(redisPort || '6379'),
  };

  return redisPassword ? { enabled: true, ...connection, password: redisPassword } : { enabled: true, ...connection };
}

export const REDIS_CONFIG = createRedisConfig(process.env);

// Mirrors the frontend NEXT_PUBLIC_USE_DECISIONS flag; enforced server-side.
export const USE_DECISIONS = process.env.USE_DECISIONS === 'true';

// Whitelist of partyassets `type` values that may be returned to the client.
// Comma-separated env list; the backend is the single authority for this filter.
export const WHITELIST_ASSET_TYPES: ReadonlySet<string> = new Set(
  (process.env.WHITELIST_ASSET_TYPES ?? '')
    .split(',')
    .map(type => type.trim())
    .filter(Boolean),
);

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
} = process.env;

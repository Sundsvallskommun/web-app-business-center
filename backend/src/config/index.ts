import { config } from 'dotenv';

import { APIS } from './api-config';
export { APIS };

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const SWAGGER_ENABLED = process.env.SWAGGER_ENABLED === 'true';
export const SESSION_MEMORY = process.env.SESSION_MEMORY === 'true';

// Feature flags (mirror the frontend NEXT_PUBLIC_* flags; enforce data server-side)
export const USE_DECISIONS = process.env.USE_DECISIONS === 'true';
export const USE_PARKING_PERMITS = process.env.USE_PARKING_PERMITS === 'true';
export const USE_FT_ERRAND_ASSETS = process.env.USE_FT_ERRAND_ASSETS === 'true';

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
  SAML_SUCCESS_REDIRECT,
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

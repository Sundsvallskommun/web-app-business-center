import { CAREMANAGEMENT_BASE_URL, CAREMANAGEMENT_NAMESPACE, MUNICIPALITY_ID } from '@config';

/**
 * Builds an absolute caremanagement URL scoped to the configured municipality and namespace.
 *
 * caremanagement is reached directly, NOT through the shared API gateway used by every other API,
 * so the full host comes from CAREMANAGEMENT_BASE_URL. municipalityId and namespace are injected
 * here so callers only deal with the resource path.
 *
 * @param parts Path segments appended after the municipality/namespace scope
 */
export const caremanagementUrl = (...parts: string[]): string => {
  const segments = [CAREMANAGEMENT_BASE_URL, MUNICIPALITY_ID, CAREMANAGEMENT_NAMESPACE, ...parts];
  return segments.map(segment => String(segment).replace(/^\/+|\/+$/g, '')).join('/');
};

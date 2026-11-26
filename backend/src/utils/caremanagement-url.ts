import { CAREMANAGEMENT_NAMESPACE, MUNICIPALITY_ID } from '@config';
import { getApiBase } from '@/config/api-config';
import { apiURL } from '@utils/util';

/**
 * Builds an absolute caremanagement URL on the shared API gateway (WSO2), scoped to the configured
 * municipality and namespace, so callers only deal with the resource path.
 *
 * @param parts Path segments appended after the municipality/namespace scope
 */
export const caremanagementUrl = (...parts: string[]): string =>
  apiURL(getApiBase('caremanagement'), MUNICIPALITY_ID, CAREMANAGEMENT_NAMESPACE, ...parts.map(String));

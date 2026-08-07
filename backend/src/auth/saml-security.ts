import { ValidateInResponseTo } from '@node-saml/passport-saml';

const SAML_REQUEST_ID_EXPIRATION_MS = 10 * 60 * 1000;

export const getSamlSecurityOptions = (issuer: string) => ({
  audience: issuer,
  wantAssertionsSigned: true,
  wantAuthnResponseSigned: false,
  acceptedClockSkewMs: 5_000,
  validateInResponseTo: ValidateInResponseTo.always,
  requestIdExpirationPeriodMs: SAML_REQUEST_ID_EXPIRATION_MS,
});

export const getSessionCookieOptions = (isProduction: boolean, isTestEnvironment: boolean) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProduction && !isTestEnvironment,
});

export const getAllowedRedirectUrl = (value: unknown, allowedOrigin: string | undefined): URL | undefined => {
  if (typeof value !== 'string' || !allowedOrigin) {
    return undefined;
  }

  try {
    const redirectUrl = new URL(value);
    const originUrl = new URL(allowedOrigin);
    const usesHttp = redirectUrl.protocol === 'http:' || redirectUrl.protocol === 'https:';
    const originUsesHttp = originUrl.protocol === 'http:' || originUrl.protocol === 'https:';

    return usesHttp && originUsesHttp && redirectUrl.origin === originUrl.origin ? redirectUrl : undefined;
  } catch {
    return undefined;
  }
};

export const getRelayStateRedirects = (relayState: unknown, allowedOrigin: string | undefined) => {
  const [successValue, failureValue] = typeof relayState === 'string' ? relayState.split(',', 2) : [];
  const successRedirect = getAllowedRedirectUrl(successValue, allowedOrigin);
  const failureRedirect = getAllowedRedirectUrl(failureValue, allowedOrigin) ?? successRedirect;

  return { successRedirect, failureRedirect };
};

export const serializeRelayStateRedirects = (successRedirect: URL, failureRedirect?: URL): string =>
  failureRedirect ? `${successRedirect.toString()},${failureRedirect.toString()}` : successRedirect.toString();

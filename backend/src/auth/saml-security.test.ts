import {
  getAllowedRedirectUrl,
  getRelayStateRedirects,
  getSamlSecurityOptions,
  getSessionCookieOptions,
  serializeRelayStateRedirects,
} from './saml-security';

const APP_ORIGIN = 'https://minasidor.example.se';

describe('SAML security configuration', () => {
  it('requires signed assertions, audience validation, timestamps and correlated responses', () => {
    expect(getSamlSecurityOptions('business-center')).toEqual({
      audience: 'business-center',
      wantAssertionsSigned: true,
      wantAuthnResponseSigned: false,
      acceptedClockSkewMs: 5_000,
      validateInResponseTo: 'always',
      requestIdExpirationPeriodMs: 10 * 60 * 1000,
    });
  });

  it('uses browser session cookie protections without requiring the cookie on the SAML POST callback', () => {
    expect(getSessionCookieOptions(true, false)).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
    expect(getSessionCookieOptions(false, false).secure).toBe(false);
  });
});

describe('SAML redirects', () => {
  it('accepts paths on the configured application origin', () => {
    expect(getAllowedRedirectUrl(`${APP_ORIGIN}/sv/oversikt?mode=private`, APP_ORIGIN)?.toString()).toBe(`${APP_ORIGIN}/sv/oversikt?mode=private`);
  });

  it.each(['https://evil.example/phishing', 'https://minasidor.example.se@evil.example/phishing', 'javascript:alert(1)', '/relative-path'])(
    'rejects an untrusted redirect: %s',
    redirect => {
      expect(getAllowedRedirectUrl(redirect, APP_ORIGIN)).toBeUndefined();
    },
  );

  it('falls back to the safe success URL when a failure URL is not provided', () => {
    const redirects = getRelayStateRedirects(`${APP_ORIGIN}/success`, APP_ORIGIN);

    expect(redirects.successRedirect?.toString()).toBe(`${APP_ORIGIN}/success`);
    expect(redirects.failureRedirect?.toString()).toBe(`${APP_ORIGIN}/success`);
    if (!redirects.successRedirect) {
      throw new Error('Expected the same-origin redirect to be accepted');
    }
    expect(serializeRelayStateRedirects(redirects.successRedirect)).toBe(`${APP_ORIGIN}/success`);
  });

  it('does not preserve an untrusted failure URL in RelayState', () => {
    const redirects = getRelayStateRedirects(`${APP_ORIGIN}/success,https://evil.example/failure`, APP_ORIGIN);

    expect(redirects.successRedirect?.toString()).toBe(`${APP_ORIGIN}/success`);
    expect(redirects.failureRedirect?.toString()).toBe(`${APP_ORIGIN}/success`);
  });
});

import { cleanEnv, port, str, url, makeValidator } from 'envalid';

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/; // same as used in envalid

const emails = makeValidator(emailString => {
  const mailAdresses = emailString.split(',');
  mailAdresses.forEach(email => {
    if (!emailRegex.test(email)) throw new Error('Emails not formatted correctly. Should be "a@example.com" or "a@example.com,b@example.com"');
  });
  return emailString;
});

const EXAMPLE_SECRET = 'NffJVXQ7P2YqK37kEC3hcxywwaKNuv'; // shipped in .env.example.local
const RECOMMENDED_SECRET_LENGTH = 32; // ~256-bit when base64/hex

// Guard against a weak session SECRET_KEY. Enforce only in deployed envs (TEST/prod run
// NODE_ENV=production); local dev may keep the template value.
function validateSecretStrength(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  const secret = (process.env.SECRET_KEY ?? '').trim();
  if (secret === EXAMPLE_SECRET) {
    console.error('\nInsecure SECRET_KEY: it is the shipped example value; set a strong unique secret.\n');
    process.exit(1);
  }
  if (secret.length < RECOMMENDED_SECRET_LENGTH) {
    console.warn(`⚠️  SECRET_KEY is shorter than the recommended ${RECOMMENDED_SECRET_LENGTH} characters.`);
  }
}

// NOTE: Make sure we got these in ENV
const validateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str(),
    SECRET_KEY: str(),
    API_BASE_URL: str(),
    CLIENT_KEY: str(),
    CLIENT_SECRET: str(),
    PORT: port(),
    BASE_URL_PREFIX: str(),
    SAML_CALLBACK_URL: url(),
    SAML_FAILURE_REDIRECT: url(),
    SAML_ENTRY_SSO: url(),
    SAML_ISSUER: str(),
    SAML_IDP_PUBLIC_CERT: str(),
    SAML_PRIVATE_KEY: str(),
    SAML_PUBLIC_KEY: str(),
    SAML_LOGOUT_URL: str(),
    SAML_LOGOUT_CALLBACK_URL: str(),
    SAML_LOGOUT_REDIRECT: str(),
    SAML_SUCCESS_REDIRECT: str(),
    FEEDBACK_EMAIL: emails(),
  });

  validateSecretStrength();
};

export default validateEnv;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const envalid = require('envalid');

const authDependent = envalid.makeValidator((x) => {
  const authEnabled = process.env.HEALTH_AUTH === 'true';

  if (authEnabled && !x.length) {
    throw new Error(`Can't be empty if "HEALTH_AUTH" is true`);
  }

  return x;
});

envalid.cleanEnv(process.env, {
  NEXT_PUBLIC_API_URL: envalid.str(),
  HEALTH_AUTH: envalid.bool(),
  HEALTH_USERNAME: authDependent(),
  HEALTH_PASSWORD: authDependent(),
});

module.exports = {
  output: 'standalone',
  swcMinify: true,
  images: {
    //unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return [{ source: '/napi/:path*', destination: '/api/:path*' }];
  },
};

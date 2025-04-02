/* eslint-disable @typescript-eslint/no-require-imports */
const envalid = require('envalid');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

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

module.exports = withBundleAnalyzer({
  output: 'standalone',
  images: {
    remotePatterns: [{ hostname: process.env.DOMAIN_NAME || 'localhost' }],
    formats: ['image/avif', 'image/webp'],
  },
  basePath: process.env.BASE_PATH,
  sassOptions: {
    functions: {
      'env($variable)': (variable) => {
        const value = variable.getValue();
        const envValue = process.env[value];
        const sassValue = new nodeSass.SassString(envValue);
        return sassValue;
      },
    },
  },
  transpilePackages: ['lucide-react'],
  experimental: {
    swcPlugins: process.env.TEST === 'true' ? [['swc-plugin-coverage-instrument', {}]] : [],
    optimizePackageImports: ['@sk-web-gui'],
  },
  async rewrites() {
    return [{ source: '/napi/:path*', destination: '/api/:path*' }];
  },
});

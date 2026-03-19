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
  turbopack: {},
  images: {
    remotePatterns: [{ hostname: process.env.DOMAIN_NAME || 'localhost' }],
    formats: ['image/avif', 'image/webp'],
  },
  basePath: process.env.BASE_PATH,
  transpilePackages: ['lucide-react'],
  experimental: {
    optimizePackageImports: ['@sk-web-gui/core', '@sk-web-gui/react', 'dayjs'],
  },
  async rewrites() {
    return [{ source: '/napi/:path*', destination: '/api/:path*' }];
  },
  //Note: This is a workaround for JS not working correctly when reloading a page.
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
});

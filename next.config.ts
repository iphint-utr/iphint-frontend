import type { NextConfig } from "next";
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // This allows images from any HTTPS domain
      },
      {
        protocol: 'http',
        hostname: '**', // This allows images from any HTTP domain (optional)
      },
    ],
  },
};

export default withNextIntl(nextConfig);
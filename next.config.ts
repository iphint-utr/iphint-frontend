import type { NextConfig } from "next";
const withNextIntl = require('next-intl/plugin')();

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Ensure your images from Cloudinary/S3 are allowed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Adjust this to your specific image provider for security
      },
    ],
  },
};

export default withNextIntl(nextConfig);
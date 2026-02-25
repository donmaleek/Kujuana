import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@kujuana/shared', '@kujuana/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;

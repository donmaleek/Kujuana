/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kujuana/shared', '@kujuana/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;

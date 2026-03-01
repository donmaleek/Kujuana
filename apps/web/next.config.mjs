const API_PREFIX = "/api/v1";

function getApiOriginForRewrite() {
  const configured = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";
  const trimmed = configured.trim().replace(/\/+$/, "");
  const normalized = trimmed.endsWith(API_PREFIX) ? trimmed : `${trimmed}${API_PREFIX}`;
  return normalized.replace(/\/api\/v1$/, "");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,

  transpilePackages: ['@kujuana/shared', '@kujuana/ui'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // If you need other exact hosts, add them explicitly (no wildcards)
      // { protocol: 'https', hostname: 'your-cloud-name.cloudinary.com' },
    ],
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  async rewrites() {
    const apiOrigin = getApiOriginForRewrite().replace(/\/$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
}

export default nextConfig

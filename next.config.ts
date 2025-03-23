// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      // Redirect any requests to the NextAuth API to prevent client-side auth calls
      {
        source: '/api/auth/:path*',
        destination: '/',
        permanent: false,
      },
    ];
  },
  // For Netlify deployments
  output: 'standalone',
  transpilePackages: ['lucide-react', 'vaul'],
  experimental: {
    // Need this for stable client-side navigation
    ppr: false,
    serverActions: {
      allowedOrigins: ['localhost:3000', 'apexbase.dev', '*.same-app.com'],
    },
  },
};

export default nextConfig;

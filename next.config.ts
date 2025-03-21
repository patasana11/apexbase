/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't run type checking during build (speeds up build)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Don't run ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // External URL domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.gsbapps.net',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  // Other options
  reactStrictMode: true,
  swcMinify: true,
  // Experimental features
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;

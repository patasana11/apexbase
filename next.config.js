/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for deployment
  output: 'standalone',

  // Don't run type checking during build (speeds up build)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Don't run ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure image domains for remote images
  images: {
    domains: ['images.unsplash.com', 'same-assets.com'],
  },

  // Handle redirects
  async redirects() {
    return [
      {
        source: '/signup',
        destination: '/registration',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

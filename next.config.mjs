/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Optimize React Server Component requests
  experimental: {
    // Optimize the RSC payload size
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-avatar',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      'lucide-react',
      'react-icons',
    ],
    // Improve stability between server and client rendering
    serverMinification: true,
    // Add React's partial prerendering for better performance
    ppr: true,
  }
};

export default nextConfig;

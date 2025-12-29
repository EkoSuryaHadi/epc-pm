/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Output configuration for Cloudflare Pages
  output: 'standalone',

  // Image optimization
  images: {
    unoptimized: true, // Cloudflare handles image optimization
  },

  // Environment variables
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },

  // Transpile packages
  transpilePackages: ['tailwind-merge', 'clsx', 'class-variance-authority'],

  // Disable x-powered-by header
  poweredByHeader: false,
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  transpilePackages: ['tailwind-merge', 'clsx', 'class-variance-authority'],
};

module.exports = nextConfig;

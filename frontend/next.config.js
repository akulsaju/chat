/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
  },
  images: {
    unoptimized: process.env.NEXT_OUTPUT === 'export',
    domains: ['localhost', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig

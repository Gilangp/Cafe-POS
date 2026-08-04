/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Proxy semua request /api/v1/* ke Laravel backend
  // Ini menghilangkan CORS karena browser hanya melihat localhost:3000
  async rewrites() {
    // Gunakan URL dari Vercel/Ngrok jika ada, hapus '/api' atau '/api/v1' di belakangnya agar tidak dobel
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api(\/v1)?\/?$/, '') 
      : 'http://localhost:8000';

    return [
      {
        source: '/api/v1/:path*',
        destination: `${baseUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
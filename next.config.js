/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Powered-By',
            value: 'moonshot-next',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.MOONSHOT_API_URL || 'http://localhost:5000'}/api/v1/:path*`,
      },
    ]
  },
}

module.exports = nextConfig

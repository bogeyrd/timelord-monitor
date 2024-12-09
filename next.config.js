/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  env: {
    apiUrl:'127.0.0.1:19191'
  }
}

module.exports = nextConfig

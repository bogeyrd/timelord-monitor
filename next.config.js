/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    apiUrl: 'https://timelord.bhd.one',
  }
}

module.exports = nextConfig

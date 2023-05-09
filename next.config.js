/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    apiUrl: 'https://testnet3-timelord-api.intgrow.com',
  }
}

module.exports = nextConfig

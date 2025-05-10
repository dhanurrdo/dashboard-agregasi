/** @type {import('next').NextConfig} */
const nextConfig = {
  cache: {
    type: 'memory',
  },
  experimental: {
    webpackBuildWorker: false,
  },
}

module.exports = nextConfig
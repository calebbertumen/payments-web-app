/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Set Turbopack root to current directory to avoid lockfile detection warning
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig

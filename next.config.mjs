/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove swcMinify as it's no longer needed in Next.js 15
  // swcMinify: true,
  
  // Keep other options
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  }
}

export default nextConfig

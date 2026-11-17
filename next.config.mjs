/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Los soportes (PDF/fotos de facturas) suben por server actions.
    serverActions: { bodySizeLimit: '10mb' },
  },
}

export default nextConfig

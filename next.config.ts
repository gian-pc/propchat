import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  // 1. Tu configuración existente
  reactCompiler: true,

  // 2. La configuración que necesitas AÑADIR
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
};

export default nextConfig;
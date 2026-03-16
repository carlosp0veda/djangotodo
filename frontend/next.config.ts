import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.DJANGO_API_URL}/api/:path*`, // Proxy to Backend

      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.digitecgalaxus.ch",
      },
      {
        protocol: "https",
        hostname: "i5.walmartimages.com",
      },
      {
        protocol: "https",
        hostname: "content.abt.com",
      },
      {
        protocol: "https",
        hostname: "images2.thanhnien.vn",
      },
    ],
  },
};

export default nextConfig;
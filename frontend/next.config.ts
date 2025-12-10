import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/library/images/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_BACKEND_HOSTNAME || "example.com",
        port: "",
        pathname: "/library/images/**",
      },
    ],
  },

};

export default nextConfig;

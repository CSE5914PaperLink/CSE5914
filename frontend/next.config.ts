import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Firebase App Hosting
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
        hostname: "*.run.app",
        pathname: "/library/images/**",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },
  // Ensure native modules are included in standalone output
  outputFileTracingIncludes: {
    "*": [
      "./node_modules/lightningcss/**/*",
      "./node_modules/lightningcss-linux-x64-gnu/**/*",
      "./node_modules/@tailwindcss/oxide/**/*",
      "./node_modules/@tailwindcss/oxide-linux-x64-gnu/**/*",
    ],
  },
};

export default nextConfig;

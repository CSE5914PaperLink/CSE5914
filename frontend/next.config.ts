import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",
  
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
      {
        protocol: "https",
        hostname: "*.a.run.app",
        pathname: "/library/images/**",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
      // Don't alias firebase.client here - it breaks client components
    },
  },
  webpack: (config, { isServer }) => {
    // Ensure Firebase Auth SDK and client module are not bundled in server builds
    if (isServer) {
      config.externals = config.externals || [];
      // Exclude Firebase Auth from server bundle
      config.externals.push({
        "firebase/auth": "commonjs firebase/auth",
      });
      // Exclude the client Firebase module from server bundle
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias["@/lib/firebase.client"] = false;
    }
    return config;
  },
};

export default nextConfig;
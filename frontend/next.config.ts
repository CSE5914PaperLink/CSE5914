import type { NextConfig } from "next";

// Get backend URL from environment (for image remote patterns)
// In production, set NEXT_PUBLIC_BACKEND_URL to your backend URL
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
let backendHostname: string;
let backendProtocol: "http" | "https" = "http";

try {
  const url = new URL(backendUrl);
  backendHostname = url.hostname;
  backendProtocol = url.protocol === "https:" ? "https" : "http";
} catch {
  // Fallback if URL parsing fails
  backendHostname = "localhost";
  backendProtocol = "http";
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: backendProtocol,
        hostname: backendHostname,
        ...(backendProtocol === "http" && backendHostname === "localhost"
          ? { port: "8000" }
          : {}),
        pathname: "/library/images/**",
      },
    ],
  },
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },
};

export default nextConfig;

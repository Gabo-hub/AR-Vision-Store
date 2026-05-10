import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@ar-project/react-wrapper", "@ar-project/engine-core"],

  // Required for WebAssembly (MediaPipe) to initialize in the browser.
  // COOP + COEP unlock SharedArrayBuffer and allow WASM streaming compilation.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    // Resolve monorepo package sources directly
    config.resolve.alias = {
      ...config.resolve.alias,
      "@ar-project/react-wrapper": path.resolve(__dirname, "../../packages/react-ar-wrapper/src/index.jsx"),
      "@ar-project/engine-core": path.resolve(__dirname, "../../packages/ar-engine-core/src/index.js"),
    };

    // Enable WASM async loading — required for MediaPipe face_mesh .wasm files
    if (!isServer) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
    }

    return config;
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.20',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ar-vision-store.onrender.com',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/django-media/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/media/:path*`,
      },
    ]
  },
};

export default nextConfig;

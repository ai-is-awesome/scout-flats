import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@prisma/client"],
  transpilePackages: ["@property-search/shared-types"],
  webpack: (config) => {
    const sharedTypesPath = path.resolve(__dirname, "../shared-types/src");
    console.log("sharedTypesPath", sharedTypesPath);
    config.resolve.alias = {
      ...config.resolve.alias,
      "@property-search/shared-types": sharedTypesPath,
    };
    return config;
  },
};

export default nextConfig;

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   serverExternalPackages: ["@prisma/client"],
//   transpilePackages: ["@property-search/shared-types"],
//   turbopack: {
//     resolveAlias: {
//       "@property-search/shared-types": "../shared-types/src/index.ts",
//     },
//   },
// };

// export default nextConfig;

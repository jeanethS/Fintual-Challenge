import type { NextConfig } from "next";

// GitHub Pages repo name (used for basePath/assetPrefix).
// Set NEXT_PUBLIC_REPO_NAME for custom CI or local export.
const repoName =
  process.env.NEXT_PUBLIC_REPO_NAME ??
  process.env.GITHUB_REPOSITORY?.split("/")[1] ??
  "";
const basePath = repoName ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : "",
  trailingSlash: true,
};

export default nextConfig;

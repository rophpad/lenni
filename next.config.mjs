/** @type {import('next').NextConfig} */
const nextConfig = {
  // AnyDoc ships a platform-specific native Node binding. Keep it outside
  // Turbopack's ESM chunks and load it directly in server route handlers.
  serverExternalPackages: ["@firecrawl/anydoc"],
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    typedRoutes: true,
    serverExternalPackages: ["bullmq", "ioredis", "luxon", "cron-parser", "jsonwebtoken"],
    turbopack: {
        root: __dirname,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;

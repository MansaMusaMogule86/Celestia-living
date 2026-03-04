/** @type {import('next').NextConfig} */
const nextConfig = {
    typedRoutes: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    serverExternalPackages: ["bullmq", "ioredis", "luxon", "cron-parser", "jsonwebtoken"],
    turbopack: {
        root: __dirname,
    },
};

module.exports = nextConfig;

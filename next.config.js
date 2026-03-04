/** @type {import('next').NextConfig} */
const nextConfig = {
    typedRoutes: true,
    serverExternalPackages: ["bullmq", "ioredis", "luxon", "cron-parser", "jsonwebtoken"],
    turbopack: {
        root: __dirname,
    },
};

module.exports = nextConfig;

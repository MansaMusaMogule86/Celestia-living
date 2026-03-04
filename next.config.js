/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ["bullmq", "ioredis", "luxon", "cron-parser", "jsonwebtoken"],
    turbopack: {
        root: __dirname,
    },
};

module.exports = nextConfig;

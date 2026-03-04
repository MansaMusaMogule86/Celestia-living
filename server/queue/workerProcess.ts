/**
 * Worker process entry point.
 * Run this as a separate process: `npx tsx server/queue/workerProcess.ts`
 */

import { createWorkers } from "./workers";

console.log("🚀 Starting campaign automation workers...");
console.log(`📡 Redis URL: ${process.env.REDIS_URL || "redis://localhost:6379"}`);
console.log(`🕐 Started at: ${new Date().toISOString()}`);

const workers = createWorkers();

// Graceful shutdown
async function shutdown(signal: string) {
    console.log(`\n🛑 Received ${signal}. Shutting down workers...`);

    await Promise.all([
        workers.publishWorker.close(),
        workers.syncWorker.close(),
        workers.automationWorker.close(),
        workers.metricsWorker.close(),
    ]);

    console.log("✅ All workers shut down gracefully");
    process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

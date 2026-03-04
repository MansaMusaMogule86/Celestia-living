export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        // Dynamically import to avoid issues in other runtimes
        const { startAutomationEngine } = await import("./server/services/automationEngine");
        startAutomationEngine();
        console.log("🚀 [Instrumentation] Automation Engine initialized");
    }
}

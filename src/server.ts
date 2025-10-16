/**
 * Server Entry Point
 * Starts the Express server and handles graceful shutdown
 */

import app from "./app";
import config from "./config";
import { validateHederaConfig } from "./services/hedera.service";
import { disconnectDatabase } from "./services/document.service";

/**
 * Starts the HTTP server
 */
async function startServer(): Promise<void> {
  try {
    console.log("Validating Hedera configuration...");
    await validateHederaConfig();
    console.log("✓ Hedera configuration is valid");

    const server = app.listen(config.port, () => {
      console.log("");
      console.log("=".repeat(50));
      console.log("🚀 Dtrust API Server Started");
      console.log("=".repeat(50));
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Port: ${config.port}`);
      console.log(`Hedera Network: ${config.hedera.network}`);
      console.log(`HCS Topic ID: ${config.hedera.topicId}`);
      console.log("");
      console.log("Available endpoints:");
      console.log(`  GET  http://localhost:${config.port}/health`);
      console.log(`  POST http://localhost:${config.port}/api/v1/anchor`);
      console.log(`  POST http://localhost:${config.port}/api/v1/verify`);
      console.log("=".repeat(50));
      console.log("");
    });

    // ==========================================
    // Graceful Shutdown Handling
    // ==========================================

    /**
     * Handles graceful shutdown
     */
    async function gracefulShutdown(signal: string): Promise<void> {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("HTTP server closed");

        try {
          await disconnectDatabase();
          console.log("Database connection closed");

          console.log("Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          console.error("Error during graceful shutdown:", error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    }

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("uncaughtException", (error: Error) => {
      console.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

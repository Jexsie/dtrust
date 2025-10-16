/**
 * Express Application Setup
 * Configures and exports the Express application instance
 */

import express, { Application, Request, Response, NextFunction } from "express";
import anchorRoutes from "./api/routes/anchor.routes";
import verifyRoutes from "./api/routes/verify.routes";

/**
 * Creates and configures the Express application
 * @returns Configured Express application
 */
function createApp(): Application {
  const app = express();

  // ==========================================
  // Middleware Configuration
  // ==========================================

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
  });

  // ==========================================
  // Health Check Endpoint
  // ==========================================

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
      status: "ok",
      message: "Dtrust API is running",
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // API Routes
  // ==========================================

  // Mount anchor routes
  app.use("/api/v1/anchor", anchorRoutes);

  // Mount verify routes
  app.use("/api/v1/verify", verifyRoutes);

  // ==========================================
  // Root Endpoint
  // ==========================================

  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      name: "Dtrust API",
      version: "1.0.0",
      description: "Asset verification tool built on Hedera Hashgraph",
      endpoints: {
        health: "GET /health",
        anchor: "POST /api/v1/anchor (authenticated)",
        verify: "POST /api/v1/verify (public)",
      },
    });
  });

  // ==========================================
  // 404 Handler
  // ==========================================

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.method} ${req.path} not found`,
    });
  });

  // ==========================================
  // Global Error Handler
  // ==========================================

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);

    // Handle multer errors
    if (err.name === "MulterError") {
      if (err.message.includes("File too large")) {
        res.status(413).json({
          error: "Payload Too Large",
          message: "File size exceeds the maximum limit of 50MB",
        });
        return;
      }
      res.status(400).json({
        error: "Bad Request",
        message: err.message,
      });
      return;
    }

    // Generic error response
    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  });

  return app;
}

const app = createApp();

export default app;

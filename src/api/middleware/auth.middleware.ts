/**
 * Authentication Middleware
 * Validates API keys for authenticated endpoints
 */

import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Extended Request interface to include organization data
 */
export interface AuthenticatedRequest extends Request {
  organization?: {
    id: string;
    name: string;
  };
}

/**
 * Middleware to authenticate requests using API keys
 * Expects the API key in the Authorization header as a Bearer token
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export async function apiKeyAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Missing Authorization header",
      });
      return;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        error: "Unauthorized",
        message:
          "Invalid Authorization header format. Expected: Bearer <API_KEY>",
      });
      return;
    }

    const apiKey = parts[1];

    if (!apiKey) {
      res.status(401).json({
        error: "Unauthorized",
        message: "API key is required",
      });
      return;
    }

    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!apiKeyRecord) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid API key",
      });
      return;
    }

    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      res.status(401).json({
        error: "Unauthorized",
        message: "API key has expired",
      });
      return;
    }

    // Update the lastUsedAt timestamp (fire and forget - don't wait for it)
    prisma.apiKey
      .update({
        where: { id: apiKeyRecord.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((error: Error) => {
        console.error("Error updating API key lastUsedAt:", error);
      });

    req.organization = apiKeyRecord.organization;

    next();
  } catch (error) {
    console.error("Error in API key authentication:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred during authentication",
    });
  }
}

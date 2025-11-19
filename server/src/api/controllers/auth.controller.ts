/**
 * Authentication Controller
 * Handles signup and login operations
 */

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { createDidFromPublicKey } from "../../services/did.service";

const prisma = new PrismaClient();

/**
 * Generates a secure random API key
 * @returns Hexadecimal string API key
 */
function generateApiKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Signup request interface
 */
interface SignupRequest {
  name: string;
  email: string;
  contactName: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  did?: string; // DID from non-custodial registration (new flow)
  publicKey?: string; // Public key for legacy flow (deprecated)
}

/**
 * Login request interface
 */
interface LoginRequest {
  apiKey: string;
}

/**
 * POST /api/v1/auth/signup
 * Creates a new organization, generates API key, and creates DID
 *
 * Body: { name: string, email: string, contactName: string, publicKey: string, ... }
 * Returns: { apiKey: string, did: string, organization: { id, name } }
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      email,
      contactName,
      contactPhone,
      website,
      address,
      city,
      country,
      description,
      did,
      publicKey, // Legacy support
    }: SignupRequest = req.body;

    // Validate required fields
    if (!name || typeof name !== "string") {
      res.status(400).json({
        error: "Bad Request",
        message: "Organization name is required",
      });
      return;
    }

    if (!email || typeof email !== "string") {
      res.status(400).json({
        error: "Bad Request",
        message: "Email is required",
      });
      return;
    }

    if (!contactName || typeof contactName !== "string") {
      res.status(400).json({
        error: "Bad Request",
        message: "Contact name is required",
      });
      return;
    }

    // Validate that either DID (new flow) or publicKey (legacy) is provided
    if (!did && !publicKey) {
      res.status(400).json({
        error: "Bad Request",
        message:
          "Either DID (from non-custodial registration) or publicKey is required",
      });
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedContactName = contactName.trim();

    if (trimmedName.length === 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "Organization name cannot be empty",
      });
      return;
    }

    if (trimmedEmail.length === 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "Email cannot be empty",
      });
      return;
    }

    if (trimmedContactName.length === 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "Contact name cannot be empty",
      });
      return;
    }

    // Check if organization already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { name: trimmedName },
    });

    if (existingOrg) {
      res.status(409).json({
        error: "Conflict",
        message: "Organization name already exists",
      });
      return;
    }

    // Step 1: Create organization with all provided fields
    const organization = await prisma.organization.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        contactName: trimmedContactName,
        contactPhone: contactPhone?.trim() || null,
        website: website?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || null,
        description: description?.trim() || null,
      } as any, // Type assertion needed until Prisma client is regenerated
    });

    // Step 2: Generate and create API key
    const apiKeyValue = generateApiKey();

    await prisma.apiKey.create({
      data: {
        key: apiKeyValue,
        organizationId: organization.id,
      },
    });

    // Step 3: Handle DID creation
    let didString: string;

    if (did) {
      // New flow: DID was already created via non-custodial registration
      didString = did;
      console.log(
        `Using pre-created DID for organization: ${organization.name} (${organization.id})`
      );
    } else if (publicKey) {
      // Legacy flow: Create DID from public key (server pays)
      console.log(
        `Creating DID from public key for organization: ${organization.name} (${organization.id})`
      );
      didString = await createDidFromPublicKey(publicKey);
    } else {
      throw new Error("Either DID or publicKey must be provided");
    }

    // Step 4: Save DID to organization (no private key stored)
    const updatedOrganization = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        did: didString,
      },
      select: {
        id: true,
        name: true,
        did: true,
      },
    });

    console.log(
      `New organization created: ${organization.name} (${organization.id}) with DID: ${didString}`
    );

    res.status(201).json({
      message: "Organization created successfully",
      apiKey: apiKeyValue,
      did: didString,
      organization: {
        id: updatedOrganization.id,
        name: updatedOrganization.name,
      },
    });
  } catch (error) {
    console.error("Error in signup:", error);

    // Check if it's a DID creation error
    if (error instanceof Error && error.message.includes("DID")) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to create DID for organization",
        details: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to create organization",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * POST /api/v1/auth/login
 * Validates an API key and returns organization information
 *
 * Body: { apiKey: string }
 * Returns: { organization: { id, name, did } }
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { apiKey }: LoginRequest = req.body;

    if (!apiKey || typeof apiKey !== "string") {
      res.status(400).json({
        error: "Bad Request",
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
            did: true,
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

    // Update lastUsedAt
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    res.status(200).json({
      message: "Login successful",
      organization: apiKeyRecord.organization,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to authenticate",
    });
  }
}

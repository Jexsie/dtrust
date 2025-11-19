/**
 * Authentication Controller
 * Handles signup and login operations
 */

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

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
  did?: string;
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
    }: SignupRequest = req.body;

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

    if (!did) {
      res.status(400).json({
        error: "Bad Request",
        message: "DID is required",
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

    // Check if organization with this DID already exists
    // DID is the primary identifier for organizations
    const existingOrg = await prisma.organization.findUnique({
      where: { did: did },
    });

    if (existingOrg) {
      res.status(409).json({
        error: "Conflict",
        message: "An organization with this DID already exists",
      });
      return;
    }

    // Create organization with DID as the primary identifier
    // DID is required and unique - it identifies the organization
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
        did: did, // DID is the primary identifier
      } as any,
    });

    // Step 2: Generate and create API key
    const apiKeyValue = generateApiKey();

    await prisma.apiKey.create({
      data: {
        key: apiKeyValue,
        organizationId: organization.id, // Use organization.id, not organization.did
      },
    });

    console.log(
      `New organization created: ${organization.name} (${organization.id}) with DID: ${did}`
    );

    res.status(201).json({
      message: "Organization created successfully",
      apiKey: apiKeyValue,
      did: did,
      organization,
    });
  } catch (error) {
    console.error("Error in signup:", error);

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

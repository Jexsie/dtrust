/**
 * Organization Controller
 * Handles organization-related operations including DID management
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { PrismaClient } from "@prisma/client";
import { createDidFromPublicKey } from "../../services/did.service";
import { resolveDID } from "@hiero-did-sdk/resolver";

const prisma = new PrismaClient();

/**
 * Creates a DID for the authenticated organization using their public key
 *
 * This endpoint:
 * 1. Validates the API key to identify the organization
 * 2. Checks if the organization already has a DID
 * 3. Accepts the organization's public key (private key never touches server)
 * 4. Creates and registers the DID on Hedera (server pays transaction fees)
 * 5. Saves only the DID string to the organization record
 * 6. Returns the DID string
 *
 * Request Body: { publicKey: string } - Public key in hex format
 *
 * @param req - Authenticated Express request
 * @param res - Express response object
 */
export async function createOrganizationDid(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.organization) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Organization information not found",
      });
      return;
    }

    const organizationId = req.organization.id;

    // Validate request body
    const { publicKey } = req.body as { publicKey?: string };

    if (!publicKey || typeof publicKey !== "string") {
      res.status(400).json({
        error: "Bad Request",
        message: "Public key is required in request body",
      });
      return;
    }

    // Check if organization already has a DID
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, did: true },
    });

    if (!organization) {
      res.status(404).json({
        error: "Not Found",
        message: "Organization not found",
      });
      return;
    }

    if (organization.did) {
      res.status(409).json({
        error: "Conflict",
        message: "Organization already has a DID",
        did: organization.did,
      });
      return;
    }

    console.log(
      `Creating DID from public key for organization: ${organization.name} (${organizationId})`
    );

    // Create DID from organization's public key
    // The server's account is used to pay for the transaction fees
    // The organization's private key never touches the server
    const didString = await createDidFromPublicKey(publicKey);

    // Save only the DID string (no private key stored)
    const updatedOrganization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        did: didString,
        // Note: didPrivateKey is not set - organization keeps it secret
      },
      select: {
        id: true,
        name: true,
        did: true,
      },
    });

    console.log(
      `DID created successfully for organization: ${organization.name}`
    );

    res.status(201).json({
      message: "DID created successfully",
      did: updatedOrganization.did,
    });
  } catch (error) {
    console.error("Error creating organization DID:", error);

    // Check if it's a Hedera-specific error
    if (error instanceof Error && error.message.includes("Hedera")) {
      res.status(503).json({
        error: "Service Unavailable",
        message:
          "Failed to create DID on Hedera network. Please try again later.",
        details: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while creating the DID",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Resolves and returns the public DID document for the authenticated organization
 *
 * This endpoint:
 * 1. Retrieves the organization's DID
 * 2. Resolves the DID document from Hedera
 * 3. Returns the public DID document
 *
 * @param req - Authenticated Express request
 * @param res - Express response object
 */
export async function getOrganizationDid(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.organization) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Organization information not found",
      });
      return;
    }

    const organizationId = req.organization.id;

    // Get the organization's DID
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, did: true },
    });

    if (!organization) {
      res.status(404).json({
        error: "Not Found",
        message: "Organization not found",
      });
      return;
    }

    if (!organization.did) {
      res.status(404).json({
        error: "Not Found",
        message: "Organization does not have a DID. Please create one first.",
      });
      return;
    }

    console.log(`Resolving DID for organization: ${organization.name}`);

    // Resolve the DID document
    const didDocument = await resolveDID(organization.did);

    res.status(200).json({
      did: organization.did,
      didDocument: didDocument,
    });
  } catch (error) {
    console.error("Error resolving organization DID:", error);

    // Check if it's a DID resolution error
    if (error instanceof Error && error.message.includes("DID not found")) {
      res.status(404).json({
        error: "Not Found",
        message: error.message,
      });
      return;
    }

    // Check if it's a Hedera-specific error
    if (error instanceof Error && error.message.includes("Hedera")) {
      res.status(503).json({
        error: "Service Unavailable",
        message:
          "Failed to resolve DID from Hedera network. Please try again later.",
        details: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while resolving the DID",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Gets the DID and private key for the authenticated organization
 *
 * This endpoint:
 * 1. Retrieves the organization's DID and private key
 * 2. Returns them to the client (for signing)
 *
 * Note: In production, private keys should never leave the server.
 * This is only for hackathon/demo purposes.
 *
 * @param req - Authenticated Express request
 * @param res - Express response object
 */
export async function getOrganizationDidAndKey(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.organization) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Organization information not found",
      });
      return;
    }

    const organizationId = req.organization.id;

    // Get the organization's DID and private key
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true, did: true, didPrivateKey: true },
    });

    if (!organization) {
      res.status(404).json({
        error: "Not Found",
        message: "Organization not found",
      });
      return;
    }

    if (!organization.did || !organization.didPrivateKey) {
      res.status(404).json({
        error: "Not Found",
        message:
          "Organization does not have a DID. Please create one first using POST /api/v1/organization/did",
      });
      return;
    }

    res.status(200).json({
      did: organization.did,
      didPrivateKey: organization.didPrivateKey,
    });
  } catch (error) {
    console.error("Error getting organization DID and key:", error);

    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while retrieving the DID and key",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

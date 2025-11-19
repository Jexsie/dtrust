/**
 * Anchor Controller
 * Handles document anchoring to the Hedera network
 */

import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  findProofByHash,
  createDocumentProof,
} from "../../services/document.service";
import { submitHashToHCS } from "../../services/hedera.service";
import { verifySignature } from "../../services/did.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

/**
 * Request body interface for anchor endpoint
 */
interface AnchorRequest {
  documentHash: string;
  did: string;
  signature: string;
}

/**
 * Anchors a document to the Hedera Consensus Service (HCS)
 *
 * This endpoint:
 * 1. Requires API key authentication (validates organization)
 * 2. Accepts documentHash, did, and signature in JSON
 * 3. Verifies the signature using the DID's public key
 * 4. Ensures the DID belongs to the authenticated organization
 * 5. Checks if the document has already been anchored
 * 6. If not, submits the proof (hash, did, signature) to HCS as JSON
 * 7. Saves the proof to the database
 *
 * Authentication: API key required (X-API-Key header)
 * The signature cryptographically proves ownership of the DID
 *
 * @param req - Authenticated Express request with JSON body
 * @param res - Express response object
 */
export async function anchorDocument(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const body = req.body as AnchorRequest;

    // Validate request body
    if (!body.documentHash || !body.did || !body.signature) {
      res.status(400).json({
        error: "Bad Request",
        message:
          "Missing required fields. Please provide: documentHash, did, and signature.",
      });
      return;
    }

    const { documentHash, did, signature } = body;

    // Get the authenticated organization from the API key
    if (!req.organization) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Organization information not found",
      });
      return;
    }

    const authenticatedOrg = req.organization;

    console.log(
      `Anchoring document for organization: ${authenticatedOrg.name} (${authenticatedOrg.id})`
    );
    console.log(`Anchoring document with DID: ${did}`);
    console.log(`Document hash: ${documentHash}`);

    // Verify that the DID belongs to the authenticated organization
    // Fetch the full organization record to check the DID
    const fullOrg = await prisma.organization.findUnique({
      where: { id: authenticatedOrg.id },
      select: { id: true, name: true, did: true },
    });

    if (!fullOrg || !fullOrg.did) {
      res.status(403).json({
        error: "Forbidden",
        message:
          "Your organization does not have a DID registered. Please complete signup first.",
      });
      return;
    }

    if (fullOrg.did !== did) {
      res.status(403).json({
        error: "Forbidden",
        message:
          "The provided DID does not belong to your organization. Please use your organization's DID.",
      });
      return;
    }

    // Verify the signature before proceeding
    // This ensures the private key holder signed the document
    console.log("Verifying signature...");
    const isValid = await verifySignature(did, documentHash, signature);

    if (!isValid) {
      res.status(403).json({
        error: "Forbidden",
        message:
          "Signature verification failed. The signature is not valid for this document hash and DID.",
      });
      return;
    }

    console.log(
      "Signature verified successfully - document signed with organization's private key"
    );
    console.log(
      `Document anchored by registered organization: ${fullOrg.name}`
    );

    // Check if document has already been anchored
    const existingProof = await findProofByHash(documentHash);

    if (existingProof) {
      res.status(409).json({
        error: "Conflict",
        message: "This document has already been anchored.",
        proof: {
          documentHash: existingProof.documentHash,
          hederaTransactionId: existingProof.hederaTransactionId,
          consensusTimestamp: existingProof.consensusTimestamp,
          issuerDid: existingProof.issuerDid,
          anchoredAt: existingProof.createdAt,
        },
      });
      return;
    }

    // Create the proof message as JSON string
    const proofMessage = JSON.stringify({
      hash: documentHash,
      did: did,
      signature: signature,
    });

    console.log("Submitting proof to Hedera HCS...");
    const hederaResult = await submitHashToHCS(proofMessage);
    console.log("Proof submitted successfully to HCS");

    // Save proof to database
    const proof = await createDocumentProof({
      documentHash,
      hederaTransactionId: hederaResult.transactionId,
      consensusTimestamp: hederaResult.consensusTimestamp,
      issuerDid: did,
    });

    console.log(`Document proof saved to database: ${proof.id}`);

    res.status(201).json({
      message: "Document anchored successfully.",
      proof: {
        documentHash: proof.documentHash,
        hederaTransactionId: proof.hederaTransactionId,
        consensusTimestamp: proof.consensusTimestamp,
        issuerDid: proof.issuerDid,
      },
    });
  } catch (error) {
    console.error("Error anchoring document:", error);

    // Check if it's a signature verification error
    if (error instanceof Error && error.message.includes("signature")) {
      res.status(403).json({
        error: "Forbidden",
        message: "Signature verification failed.",
        details: error.message,
      });
      return;
    }

    // Check if it's a Hedera-specific error
    if (error instanceof Error && error.message.includes("Hedera")) {
      res.status(503).json({
        error: "Service Unavailable",
        message:
          "Failed to anchor document to Hedera network. Please try again later.",
        details: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while anchoring the document",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

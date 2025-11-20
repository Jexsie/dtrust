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
 * SECURITY FLOW (prevents malicious uploads):
 * 1. Validates request body and input formats
 * 2. Authenticates organization via API key (Bearer token)
 * 3. CRITICAL: Verifies signature FIRST using DID's public key from Hedera network
 *    - This cryptographically proves the requester has the private key
 *    - Prevents malicious uploads even if someone has the DID
 * 4. Verifies the DID belongs to the authenticated organization
 *    - Ensures API key matches the DID owner
 *    - Prevents using someone else's DID
 * 5. Checks if the document has already been anchored
 * 6. If not, submits the proof (hash, did, signature) to HCS as JSON
 * 7. Saves the proof to the database
 *
 * Authentication: API key required (Authorization: Bearer <API_KEY>)
 * The signature cryptographically proves ownership of the DID's private key
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

    // Step 1: Validate request body
    if (!body.documentHash || !body.did || !body.signature) {
      res.status(400).json({
        error: "Bad Request",
        message:
          "Missing required fields. Please provide: documentHash, did, and signature.",
      });
      return;
    }

    const { documentHash, did, signature } = body;

    // Validate format of inputs
    if (typeof documentHash !== "string" || documentHash.length === 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "documentHash must be a non-empty string",
      });
      return;
    }

    if (typeof did !== "string" || !did.startsWith("did:hedera:")) {
      res.status(400).json({
        error: "Bad Request",
        message: "did must be a valid Hedera DID (starting with 'did:hedera:')",
      });
      return;
    }

    if (typeof signature !== "string" || signature.length === 0) {
      res.status(400).json({
        error: "Bad Request",
        message: "signature must be a non-empty hex string",
      });
      return;
    }

    // Step 2: Get the authenticated organization from the API key
    if (!req.organization) {
      res.status(401).json({
        error: "Unauthorized",
        message:
          "Organization information not found. Invalid or missing API key.",
      });
      return;
    }

    const authenticatedOrg = req.organization;

    console.log(
      `Anchoring request from authenticated organization: ${authenticatedOrg.name} (${authenticatedOrg.id})`
    );
    console.log(`Requested DID: ${did}`);
    console.log(`Document hash: ${documentHash.substring(0, 16)}...`);

    // Step 3: CRITICAL SECURITY CHECK - Verify signature FIRST
    // This prevents malicious uploads even if someone has the DID
    // The signature proves the requester has the private key for this DID
    console.log("Verifying signature cryptographically...");
    const isValid = await verifySignature(did, documentHash, signature);

    if (!isValid) {
      console.error(
        `Signature verification FAILED for DID: ${did}. Possible malicious upload attempt.`
      );
      res.status(403).json({
        error: "Forbidden",
        message:
          "Signature verification failed. The signature is not valid for this document hash and DID. Only the private key holder can anchor documents.",
      });
      return;
    }

    console.log(
      "✓ Signature verified successfully - cryptographic proof of private key ownership confirmed"
    );

    // Step 4: Verify that the DID belongs to the authenticated organization
    // This ensures the API key matches the DID being used
    const fullOrg = await prisma.organization.findUnique({
      where: { did: did },
      select: { id: true, name: true, did: true },
    });

    if (!fullOrg || !fullOrg.did) {
      console.error(
        `DID ${did} not found in database. Possible unauthorized DID usage.`
      );
      res.status(403).json({
        error: "Forbidden",
        message:
          "The provided DID is not registered in our system. Please complete signup first.",
      });
      return;
    }

    // Verify the authenticated organization matches the DID owner
    if (fullOrg.id !== authenticatedOrg.id) {
      console.error(
        `API key organization (${authenticatedOrg.id}) does not match DID owner (${fullOrg.id}). Unauthorized access attempt.`
      );
      res.status(403).json({
        error: "Forbidden",
        message:
          "The provided DID does not belong to your organization. You can only anchor documents with your organization's DID.",
      });
      return;
    }

    // Verify the authenticated organization's DID matches the provided DID
    if (authenticatedOrg.did !== did) {
      console.error(
        `Authenticated org DID (${authenticatedOrg.did}) does not match provided DID (${did}).`
      );
      res.status(403).json({
        error: "Forbidden",
        message:
          "The provided DID does not match your authenticated organization's DID.",
      });
      return;
    }

    console.log(
      `✓ DID ownership verified - ${fullOrg.name} (${fullOrg.id}) owns DID: ${did}`
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

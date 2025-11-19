/**
 * Anchor Controller
 * Handles document anchoring to the Hedera network
 */

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  findProofByHash,
  createDocumentProof,
} from "../../services/document.service";
import { submitHashToHCS } from "../../services/hedera.service";
import { verifySignature } from "../../services/did.service";

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
 * 1. Accepts documentHash, did, and signature in JSON
 * 2. Verifies the signature using the DID's public key (signature is the authentication)
 * 3. Looks up the organization by DID (for billing/audit purposes)
 * 4. Checks if the document has already been anchored
 * 5. If not, submits the proof (hash, did, signature) to HCS as JSON
 * 6. Saves the proof to the database
 *
 * Authentication: Signature-based (no API key required)
 * The signature cryptographically proves ownership of the DID
 *
 * @param req - Express request with JSON body
 * @param res - Express response object
 */
export async function anchorDocument(
  req: Request,
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

    console.log(`Anchoring document with DID: ${did}`);
    console.log(`Document hash: ${documentHash}`);

    // Verify the signature before proceeding
    // This is the authentication - if signature is valid, we know the sender owns the DID
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
      "Signature verified successfully - sender authenticated via cryptographic proof"
    );

    // Look up organization by DID (for billing/audit purposes)
    // This is optional - the signature already proves identity
    const organization = await prisma.organization.findUnique({
      where: { did: did },
      select: { id: true, name: true },
    });

    if (organization) {
      console.log(
        `Document anchored by registered organization: ${organization.name}`
      );
    } else {
      console.log(`Document anchored by DID not in our registry: ${did}`);
    }

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

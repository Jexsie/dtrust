/**
 * Anchor Controller
 * Handles document anchoring to the Hedera network
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  calculateFileHash,
  findProofByHash,
  createDocumentProof,
} from "../../services/document.service";
import { submitHashToHCS } from "../../services/hedera.service";

/**
 * Anchors a document to the Hedera Consensus Service (HCS)
 *
 * This endpoint:
 * 1. Calculates the SHA-256 hash of the uploaded document
 * 2. Checks if the document has already been anchored
 * 3. If not, submits the hash to HCS
 * 4. Saves the proof to the database
 *
 * @param req - Authenticated Express request with file upload
 * @param res - Express response object
 */
export async function anchorDocument(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        error: "Bad Request",
        message:
          'No document file provided. Please upload a file using the "document" field.',
      });
      return;
    }

    if (!req.organization) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Organization information not found",
      });
      return;
    }

    console.log(
      `Anchoring document for organization: ${req.organization.name}`
    );

    const documentHash = calculateFileHash(req.file.buffer);
    console.log(`Document hash calculated: ${documentHash}`);

    const existingProof = await findProofByHash(documentHash);

    if (existingProof) {
      res.status(409).json({
        error: "Conflict",
        message: "This document has already been anchored.",
        proof: {
          documentHash: existingProof.documentHash,
          hederaTransactionId: existingProof.hederaTransactionId,
          consensusTimestamp: existingProof.consensusTimestamp,
          anchoredAt: existingProof.createdAt,
          anchoredByOrganizationId: existingProof.organizationId,
        },
      });
      return;
    }

    console.log("Submitting hash to Hedera HCS...");
    const hederaResult = await submitHashToHCS(documentHash);
    console.log("Hash submitted successfully to HCS");

    const proof = await createDocumentProof({
      documentHash,
      hederaTransactionId: hederaResult.transactionId,
      consensusTimestamp: hederaResult.consensusTimestamp,
      organizationId: req.organization.id,
    });

    console.log(`Document proof saved to database: ${proof.id}`);

    res.status(201).json({
      message: "Document anchored successfully.",
      proof: {
        documentHash: proof.documentHash,
        hederaTransactionId: proof.hederaTransactionId,
        consensusTimestamp: proof.consensusTimestamp,
      },
    });
  } catch (error) {
    console.error("Error anchoring document:", error);

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

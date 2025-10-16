/**
 * Verify Controller
 * Handles document verification against the Hedera network
 */

import { Request, Response } from "express";
import {
  calculateFileHash,
  getProofWithOrganization,
} from "../../services/document.service";

/**
 * Verifies a document against proofs stored in the database
 *
 * This endpoint:
 * 1. Calculates the SHA-256 hash of the uploaded document
 * 2. Looks up the hash in the database
 * 3. Returns verification status and proof details if found
 *
 * Note: This endpoint is public and does not require authentication
 *
 * @param req - Express request with file upload
 * @param res - Express response object
 */
export async function verifyDocument(
  req: Request,
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

    console.log("Verifying document...");

    const documentHash = calculateFileHash(req.file.buffer);
    console.log(`Document hash calculated: ${documentHash}`);

    // Look up the proof in the database
    const proof = await getProofWithOrganization(documentHash);

    if (proof) {
      console.log(`Document verified: ${proof.id}`);

      res.status(200).json({
        status: "VERIFIED",
        message:
          "This document is authentic and was anchored on the Hedera network.",
        proof: {
          documentHash: proof.documentHash,
          hederaTransactionId: proof.hederaTransactionId,
          consensusTimestamp: proof.consensusTimestamp,
          anchoredByOrganizationId: proof.organizationId,
          anchoredAt: proof.createdAt,
        },
      });
    } else {
      console.log(`Document not verified: hash not found in database`);

      res.status(200).json({
        status: "NOT_VERIFIED",
        message: "This document has not been anchored and cannot be verified.",
        proof: null,
      });
    }
  } catch (error) {
    console.error("Error verifying document:", error);

    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while verifying the document",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

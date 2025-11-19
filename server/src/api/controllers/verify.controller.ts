/**
 * Verify Controller
 * Handles document verification against the Hedera network
 */

import { Request, Response } from "express";
import {
  calculateFileHash,
  getProofByHash,
} from "../../services/document.service";
import { findMessageByHash } from "../../services/mirror.service";
import { verifySignature } from "../../services/did.service";
import { isTrustedIssuer } from "../../services/registry.service";
import config from "../../config";

/**
 * Verifies a document against proofs on the Hedera network
 *
 * This endpoint uses a scalable two-step approach:
 * 1. Fast database lookup (indexed, sub-second)
 * 2. Cryptographic verification (decentralized trust)
 *
 * Process:
 * 1. Calculates the SHA-256 hash of the uploaded document
 * 2. Queries the database for the proof (fast, indexed lookup)
 * 3. If found, performs decentralized verification:
 *    - Resolves DID to get public key from network
 *    - Verifies signature cryptographically
 *    - Checks trusted issuer registry
 * 4. Returns verification status and proof details
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

    // Step 1: Fast database lookup (indexed, sub-second)
    // This is the scalable approach - database is the index for HCS topic
    console.log("Querying database for proof...");
    const proof = await getProofByHash(documentHash);

    if (!proof) {
      console.log(`Document not found in database - not anchored`);
      res.status(200).json({
        status: "NOT_VERIFIED",
        message: "This document has not been anchored and cannot be verified.",
        proof: null,
      });
      return;
    }

    console.log(`Proof found in database for DID: ${proof.issuerDid}`);

    // Step 2: Decentralized cryptographic verification
    // We have the proof data from DB, but we verify it cryptographically
    // This ensures trust without relying solely on our database

    // We need to get the signature from the HCS message
    // Query mirror node to get the full message (which contains signature)
    console.log("Fetching full proof message from Hedera Mirror Node...");
    const hcsMessage = await findMessageByHash(documentHash);

    if (!hcsMessage) {
      // This shouldn't happen if DB has the proof, but handle gracefully
      console.warn(
        "Proof in database but not found in mirror node - possible sync issue"
      );
      res.status(200).json({
        status: "NOT_VERIFIED",
        message: "Proof found but could not be verified on-chain.",
        proof: null,
      });
      return;
    }

    // Parse the message content to get signature
    let messageContent: { hash: string; did: string; signature: string };
    try {
      const messageText = Buffer.from(hcsMessage.message, "base64").toString(
        "utf-8"
      );
      messageContent = JSON.parse(messageText);
    } catch (parseError) {
      console.error("Error parsing HCS message:", parseError);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to parse message from Hedera network",
      });
      return;
    }

    // Verify the signature cryptographically
    // This proves the document was signed by the DID owner
    console.log("Verifying signature cryptographically...");
    const isValid = await verifySignature(
      messageContent.did,
      messageContent.hash,
      messageContent.signature
    );

    if (!isValid) {
      console.log("Signature verification failed");
      res.status(200).json({
        status: "NOT_VERIFIED",
        message: "Signature verification failed. Document cannot be verified.",
        proof: null,
      });
      return;
    }

    console.log("Document verified on-chain - signature valid");

    // Check if the issuer is in the trusted registry
    let isTrusted = false;
    try {
      if (config.hedera.registryContractId) {
        console.log("Checking trusted issuer registry...");
        isTrusted = await isTrustedIssuer(messageContent.did);
        console.log(`Issuer trust status: ${isTrusted}`);
      } else {
        console.log("Registry contract not configured, skipping trust check");
      }
    } catch (registryError) {
      console.error("Error checking registry:", registryError);
      // Don't fail verification if registry check fails, just set isTrusted to false
      isTrusted = false;
    }

    // Return verification result
    res.status(200).json({
      status: "VERIFIED_ON_CHAIN",
      message:
        "This document is authentic and was verified on the Hedera network.",
      proof: {
        hash: proof.documentHash,
        did: proof.issuerDid,
        signature: messageContent.signature,
        consensusTimestamp: proof.consensusTimestamp,
      },
      isTrustedIssuer: isTrusted,
    });
  } catch (error) {
    console.error("Error verifying document:", error);

    // Check if it's a mirror node error
    if (error instanceof Error && error.message.includes("mirror node")) {
      res.status(503).json({
        error: "Service Unavailable",
        message: "Failed to query Hedera Mirror Node. Please try again later.",
        details: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while verifying the document",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

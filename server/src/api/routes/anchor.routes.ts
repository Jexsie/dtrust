/**
 * Anchor Routes
 * Defines routes for document anchoring operations
 */

import { Router } from "express";
import { anchorDocument } from "../controllers/anchor.controller";
import { apiKeyAuth } from "../middleware/auth.middleware";

const router: Router = Router();

/**
 * POST /api/v1/anchor
 * Anchors a document to the Hedera network
 *
 * Security: Multi-layer protection against malicious uploads
 * 1. API key authentication (Authorization: Bearer <API_KEY>)
 * 2. Cryptographic signature verification (proves private key ownership)
 * 3. DID ownership verification (ensures API key matches DID)
 *
 * Content-Type: application/json
 * Body: { documentHash: string, did: string, signature: string }
 */
router.post("/", apiKeyAuth, anchorDocument);

export default router;

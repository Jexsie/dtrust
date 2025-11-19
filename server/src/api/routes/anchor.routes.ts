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
 * Authentication: API key required (X-API-Key header)
 * The signature cryptographically proves ownership of the DID
 * Content-Type: application/json
 * Body: { documentHash: string, did: string, signature: string }
 */
router.post("/", apiKeyAuth, anchorDocument);

export default router;

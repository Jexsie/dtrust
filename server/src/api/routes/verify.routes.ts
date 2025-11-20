/**
 * Verify Routes
 * Defines routes for document verification operations
 */

import { Router } from "express";
import { verifyDocument } from "../controllers/verify.controller";

const router: Router = Router();

/**
 * POST /api/v1/verify
 * Verifies a document against the Hedera network
 *
 * Authentication: Not required (public endpoint)
 * Content-Type: application/json
 * Body: { documentHash: string }
 *
 * Note: The hash is calculated on the client side for privacy.
 * The file is never uploaded to the server.
 */
router.post("/", verifyDocument);

export default router;

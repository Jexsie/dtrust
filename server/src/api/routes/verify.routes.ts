/**
 * Verify Routes
 * Defines routes for document verification operations
 */

import { Router } from "express";
import { uploadDocument } from "../middleware/fileupload.middleware";
import { verifyDocument } from "../controllers/verify.controller";

const router = Router();

/**
 * POST /api/v1/verify
 * Verifies a document against the Hedera network
 *
 * Authentication: Not required (public endpoint)
 * Content-Type: multipart/form-data
 * Field: document (file)
 */
router.post("/", uploadDocument, verifyDocument);

export default router;

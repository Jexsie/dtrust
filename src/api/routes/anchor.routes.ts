/**
 * Anchor Routes
 * Defines routes for document anchoring operations
 */

import { Router } from "express";
import { apiKeyAuth } from "../middleware/auth.middleware";
import { uploadDocument } from "../middleware/fileupload.middleware";
import { anchorDocument } from "../controllers/anchor.controller";

const router = Router();

/**
 * POST /api/v1/anchor
 * Anchors a document to the Hedera network
 *
 * Authentication: Required (API Key)
 * Content-Type: multipart/form-data
 * Field: document (file)
 */
router.post("/", apiKeyAuth, uploadDocument, anchorDocument);

export default router;

/**
 * Organization Routes
 * Defines routes for organization-related operations including DID management
 */

import { Router } from "express";
import { apiKeyAuth } from "../middleware/auth.middleware";
import {
  createOrganizationDid,
  getOrganizationDid,
  getOrganizationDidAndKey,
} from "../controllers/organization.controller";

const router: Router = Router();

/**
 * POST /api/v1/organization/did
 * Generates a new DID for the authenticated organization
 *
 * Authentication: Required (API Key)
 * Content-Type: application/json
 */
router.post("/did", apiKeyAuth, createOrganizationDid);

/**
 * GET /api/v1/organization/did
 * Resolves and returns the public DID document for the authenticated organization
 *
 * Authentication: Required (API Key)
 */
router.get("/did", apiKeyAuth, getOrganizationDid);

/**
 * GET /api/v1/organization/did/key
 * Returns the DID and private key for the authenticated organization
 *
 * WARNING: This endpoint exposes the private key. Only for hackathon/demo purposes.
 * In production, keys should never leave the server.
 *
 * Authentication: Required (API Key)
 */
router.get("/did/key", apiKeyAuth, getOrganizationDidAndKey);

export default router;

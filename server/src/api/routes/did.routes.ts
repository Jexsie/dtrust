/**
 * DID Routes
 * Routes for non-custodial DID registration
 */

import { Router, type Express } from "express";
import {
  requestDidCreation,
  submitDidCreation,
} from "../controllers/did.controller";

const router: ReturnType<typeof Router> = Router();

/**
 * POST /api/v1/did/request-creation
 * Generates a DID creation request for client signing
 */
router.post("/request-creation", requestDidCreation);

/**
 * POST /api/v1/did/submit-creation
 * Submits the signed DID creation request to Hedera
 */
router.post("/submit-creation", submitDidCreation);

export default router;

/**
 * Authentication Routes
 * Defines routes for authentication operations (signup and login)
 */

import { Router } from "express";
import { signup } from "../controllers/auth.controller";

const router: Router = Router();

/**
 * POST /api/v1/auth/signup
 * Creates a new organization and returns an API key
 *
 * Body: { organizationName: string }
 * Returns: { apiKey: string, organization: { id, name } }
 */
router.post("/signup", signup);

export default router;

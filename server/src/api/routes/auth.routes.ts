/**
 * Authentication Routes
 * Defines routes for authentication operations (signup and login)
 */

import { Router } from "express";
import { signup, login } from "../controllers/auth.controller";

const router: Router = Router();

/**
 * POST /api/v1/auth/signup
 * Creates a new organization and returns an API key
 *
 * Body: { organizationName: string }
 * Returns: { apiKey: string, organization: { id, name } }
 */
router.post("/signup", signup);

/**
 * POST /api/v1/auth/login
 * Validates an API key and returns organization information
 *
 * Body: { apiKey: string }
 * Returns: { organization: { id, name, did } }
 */
router.post("/login", login);

export default router;

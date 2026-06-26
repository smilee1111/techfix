import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { authLimiter } from "../../middlewares/rateLimit.middleware";
import {
  registerDto,
  loginDto,
  refreshTokenDto,
  updateProfileDto,
  changePasswordDto,
  addAddressDto,
} from "../dtos/auth.dto";

const router = Router();
const authController = new AuthController();

// ─── Public routes (no auth required) ───────────────────────────

// POST /api/auth/register
router.post(
  "/register",
  authLimiter,
  validate(registerDto),
  authController.register
);

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  validate(loginDto),
  authController.login
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  authLimiter,
  authController.refreshToken
);

// ─── Protected routes (auth required) ───────────────────────────

// POST /api/auth/logout
router.post("/logout", authenticate, authController.logout);

// GET /api/auth/me
router.get("/me", authenticate, authController.getProfile);

// PUT /api/auth/me
router.put(
  "/me",
  authenticate,
  validate(updateProfileDto),
  authController.updateProfile
);

// PUT /api/auth/change-password
router.put(
  "/change-password",
  authenticate,
  validate(changePasswordDto),
  authController.changePassword
);

// POST /api/auth/me/addresses
router.post(
  "/me/addresses",
  authenticate,
  validate(addAddressDto),
  authController.addAddress
);

// DELETE /api/auth/me/addresses/:index
router.delete(
  "/me/addresses/:index",
  authenticate,
  authController.removeAddress
);

export default router;

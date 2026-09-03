import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  resendVerificationEmail,
  resendVerificationEmailPublic,
  forgotPasswordRequest,
  resetPassword,
  getCurrentUser,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authRefreshLimiter, authStrictLimiter } from "../middlewares/rateLimiters.js";

const router = Router();

router.route("/register").post(authStrictLimiter, registerUser);
router.route("/login").post(authStrictLimiter, loginUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(authRefreshLimiter, refreshAccessToken);
router.route("/verify-email/:token").get(verifyEmail).post(verifyEmail);
router.route("/resend-verification-email-public").post(authStrictLimiter, resendVerificationEmailPublic);
router.route("/resend-verification-email").post(verifyJWT, authStrictLimiter, resendVerificationEmail);
router.route("/forgot-password").post(authStrictLimiter, forgotPasswordRequest);
router.route("/reset-password").post(authStrictLimiter, resetPassword);

export default router;

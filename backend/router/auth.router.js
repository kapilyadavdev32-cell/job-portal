import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  resendVerificationEmail,
  forgotPasswordRequest,
  resetPassword,
  getCurrentUser,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:token").post(verifyEmail);
router.route("/resend-verification-email").post(verifyJWT, resendVerificationEmail);
router.route("/forgot-password").post(forgotPasswordRequest);
router.route("/reset-password").post(resetPassword);

export default router;

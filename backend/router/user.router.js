import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadMyResume,
  importMyResume,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { resumeUploadLimiter } from "../middlewares/rateLimiters.js";
import { uploadResume } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(verifyJWT); // All user routes require authentication

router
  .route("/me/resume")
  .post(resumeUploadLimiter, uploadResume.single("resume"), uploadMyResume);

router
  .route("/me/resume/import")
  .post(resumeUploadLimiter, importMyResume);

router
  .route("/")
  .get(getAllUsers);

router
  .route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;

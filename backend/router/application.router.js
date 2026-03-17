import { Router } from "express";
import {
  applyToJob,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} from "../controllers/application.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All application routes require authentication

router
  .route("/")
  .post(applyToJob)
  .get(getApplications);

router
  .route("/:id")
  .get(getApplicationById)
  .put(updateApplication)
  .delete(deleteApplication);

export default router;

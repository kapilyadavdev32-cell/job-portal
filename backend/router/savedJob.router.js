import { Router } from "express";
import {
  saveJob,
  getSavedJobs,
  removeSavedJob,
} from "../controllers/savedJob.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All saved job routes require authentication

router
  .route("/")
  .post(saveJob)
  .get(getSavedJobs);

router
  .route("/:id")
  .delete(removeSavedJob);

export default router;

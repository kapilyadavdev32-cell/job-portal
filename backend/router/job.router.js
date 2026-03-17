import { Router } from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, createJob)
  .get(getJobs);

router
  .route("/:id")
  .get(getJobById)
  .put(verifyJWT, updateJob)
  .delete(verifyJWT, deleteJob);

export default router;

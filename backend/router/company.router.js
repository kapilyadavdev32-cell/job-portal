import { Router } from "express";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  verifyCompany,
} from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, createCompany)
  .get(getCompanies);

router
  .route("/:id")
  .get(getCompanyById)
  .put(verifyJWT, updateCompany)
  .delete(verifyJWT, deleteCompany);

router
  .route("/:id/verify")
  .put(verifyJWT, verifyCompany);

export default router;

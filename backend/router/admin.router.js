import { Router } from "express";
import {
  getAllUsers,
  getAllCompanies,
  verifyCompany,
  changeUserRole,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All admin routes require authentication

router.route("/users").get(getAllUsers);
router.route("/companies").get(getAllCompanies);
router.route("/companies/:id/verify").put(verifyCompany);
router.route("/users/:id/role").put(changeUserRole);

export default router;

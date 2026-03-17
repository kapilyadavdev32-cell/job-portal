import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All user routes require authentication

router
  .route("/")
  .get(getAllUsers);

router
  .route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;

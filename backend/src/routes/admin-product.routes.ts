import { Router } from "express";
import {
  getAdminProductsController,
  getAdminProductByIdController,
} from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";

const router = Router();

router.get(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  getAdminProductsController
);

router.get(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  getAdminProductByIdController
);

export default router;
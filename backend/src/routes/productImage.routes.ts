import { Router } from "express";

import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";

import {
  createProductImageController,
  deleteProductImageController,
  getProductImageByIdController,
  getProductImagesController,
  updateProductImageController,
} from "../controllers/ProductImage.controller";

const routes = Router();

routes.get(
  "/:productId/images",
  getProductImagesController
);

routes.post(
  "/:productId/images",
  authMiddleware,
  requireRole("ADMIN"),
  createProductImageController
);

routes.get(
  "/images/:id",
  authMiddleware,
  requireRole("ADMIN"),
  getProductImageByIdController
);

routes.patch(
  "/images/:id",
  authMiddleware,
  requireRole("ADMIN"),
  updateProductImageController
);

routes.delete(
  "/images/:id",
  authMiddleware,
  requireRole("ADMIN"),
  deleteProductImageController
);

export default routes;
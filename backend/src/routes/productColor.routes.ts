import { Router } from "express";

import {
    getProductColorsController,
    getProductColorByIdController,
    createProductColorController,
    updateProductColorController,
    deleteProductColorController,
} from "../controllers/productColor.controller";

import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";

const router = Router();

router.get(
    "/products/:productId/colors",
    getProductColorsController
);

router.get(
    "/products/:productId/colors/:id",
    getProductColorByIdController
);

router.post(
    "/products/:productId/colors",
    authMiddleware,
    requireRole("ADMIN"),
    createProductColorController
);

router.patch(
    "/products/:productId/colors/:id",
    authMiddleware,
    requireRole("ADMIN"),
    updateProductColorController
);

router.delete(
    "/products/:productId/colors/:id",
    authMiddleware,
    requireRole("ADMIN"),
    deleteProductColorController
);

export default router;
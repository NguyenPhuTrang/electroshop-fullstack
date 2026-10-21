import { Router } from "express";

import {
    getProductVariantsController,
    getAdminProductVariantsController,
    getProductVariantByIdController,
    createProductVariantController,
    updateProductVariantController,
    deactivateProductVariantController,
    createProductVariantsController,
} from "../controllers/productVariant.controller";

import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";

const router = Router();

router.get(
    "/products/:productId/variants",
    getProductVariantsController
);

router.get(
    "/products/:productId/variants/admin",
    authMiddleware,
    requireRole("ADMIN"),
    getAdminProductVariantsController
);

router.get(
    "/product-variants/:id",
    authMiddleware,
    requireRole("ADMIN"),
    getProductVariantByIdController
);

router.post(
    "/products/:productId/variants/bulk",
    authMiddleware,
    requireRole("ADMIN"),
    createProductVariantsController
);

router.post(
    "/products/:productId/variants",
    authMiddleware,
    requireRole("ADMIN"),
    createProductVariantController
);

router.patch(
    "/product-variants/:id",
    authMiddleware,
    requireRole("ADMIN"),
    updateProductVariantController
);

router.patch(
    "/product-variants/:id/deactivate",
    authMiddleware,
    requireRole("ADMIN"),
    deactivateProductVariantController
);


export default router;
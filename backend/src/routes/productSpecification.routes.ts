import { Router } from "express";

import {
    getProductSpecificationsController,
    getProductSpecificationByIdController,
    createProductSpecificationController,
    updateProductSpecificationController,
    deleteProductSpecificationController,
    createBulkProductSpecificationsController,
    replaceProductSpecificationsController,
} from "../controllers/productSpecification.controller";

import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";

const router = Router();

router.get(
    "/products/:productId/specifications",
    getProductSpecificationsController
);

router.get(
    "/product-specifications/:id",
    getProductSpecificationByIdController
);

router.post(
    "/product-specifications",
    authMiddleware,
    requireRole("ADMIN"),
    createProductSpecificationController
);

router.post(
    "/product-specifications/bulk",
    authMiddleware,
    requireRole("ADMIN"),
    createBulkProductSpecificationsController
);

router.patch(
    "/product-specifications/:id",
    authMiddleware,
    requireRole("ADMIN"),
    updateProductSpecificationController
);

router.put(
    "/products/:productId/specifications",
    authMiddleware,
    requireRole("ADMIN"),
    replaceProductSpecificationsController
);

router.delete(
    "/product-specifications/:id",
    authMiddleware,
    requireRole("ADMIN"),
    deleteProductSpecificationController
);

export default router;
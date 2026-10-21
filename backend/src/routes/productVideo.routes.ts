import { Router } from "express";

import { uploadProductVideoController, uploadProductVideoFromUrlController } from "../controllers/productVideo.controller";

import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";
import uploadVideoMiddleware from "../middlewares/upload-video.middleware";

const router = Router();

router.post(
    "/products/:productId/video",
    authMiddleware,
    requireRole("ADMIN"),
    uploadVideoMiddleware.single("video"),
    uploadProductVideoController
);

// Upload or replace a product video using a URL
router.post(
    "/products/:productId/video/url",
    authMiddleware,
    requireRole("ADMIN"),
    uploadProductVideoFromUrlController
);

export default router;
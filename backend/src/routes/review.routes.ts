import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import {
    adminDeleteReviewController,
    createReviewController,
    createReviewReplyController,
    deleteReviewController,
    getAdminReviewsController,
    getReviewsByProductIdController,
    updateReviewReplyController,
} from "../controllers/review.controller";
import { requireRole } from "../middlewares/role.middlewre";

const routes = Router();

routes.post(
    "/:productId/reviews",
    authMiddleware,
    createReviewController
);

routes.post(
    "/admin/reviews/:id/reply",
    authMiddleware,
    requireRole("ADMIN"),
    createReviewReplyController
);

routes.patch(
    "/admin/reviews/:id/reply",
    authMiddleware,
    requireRole("ADMIN"),
    updateReviewReplyController
);

routes.get(
    "/admin/reviews",
    authMiddleware,
    requireRole("ADMIN"),
    getAdminReviewsController
);

routes.get(
    "/:productId/reviews",
    getReviewsByProductIdController
);

routes.delete(
    "/reviews/:id",
    authMiddleware,
    deleteReviewController
);

routes.delete(
    "/admin/reviews/:id",
    authMiddleware,
    requireRole("ADMIN"),
    adminDeleteReviewController
);

export default routes;
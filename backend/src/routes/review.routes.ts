import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { adminDeleteReviewController, createReviewController, deleteReviewController, getReviewsByProductIdController } from "../controllers/review.controller";
import { requireRole } from "../middlewares/role.middlewre";

const routes = Router();

routes.post(
    "/:productId/reviews",
    authMiddleware,
    createReviewController
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
)

export default routes;
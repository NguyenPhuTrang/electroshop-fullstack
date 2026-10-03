import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import {
    createOrderController,
    getOrdersController,
    getOrderByIdController,
    updateOrderStatusController,
    getAllOrdersController,
    cancelOrderController,
    getAdminOrderByIdController
} from "../controllers/order.controller";
import { requireRole } from "../middlewares/role.middlewre";

const routes = Router();

routes.post(
    "/",
    authMiddleware,
    createOrderController
);

routes.get(
    "/",
    authMiddleware,
    getOrdersController
);

routes.get(
    "/admin",
    authMiddleware,
    requireRole("ADMIN"),
    getAllOrdersController
);

routes.get(
    "/:id",
    authMiddleware,
    getOrderByIdController
);

routes.get(
    "/admin/:id",
    authMiddleware,
    requireRole("ADMIN"),
    getAdminOrderByIdController
);

routes.patch(
    "/:id/status",
    authMiddleware,
    requireRole("ADMIN"),
    updateOrderStatusController
);

routes.patch(
    "/:id/cancel",
    authMiddleware,
    cancelOrderController
)


export default routes;
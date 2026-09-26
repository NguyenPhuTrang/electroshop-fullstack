import { Router } from "express";
import { createMbQrPaymentController, getPaymentByIdController, updatePaymentStatusController } from "../controllers/payment.controller"; 
import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";

const routes = Router();

routes.get(
    "/:id",
    authMiddleware,
    getPaymentByIdController
);

routes.patch(
    "/:id/status",
    authMiddleware,
    requireRole("ADMIN"),
    updatePaymentStatusController
);

routes.post(
    "/:id/mbbank/qr",
    authMiddleware,
    createMbQrPaymentController
);

export default routes;
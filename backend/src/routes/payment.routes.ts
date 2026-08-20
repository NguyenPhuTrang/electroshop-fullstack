import { Router } from "express";
import { getPaymentByIdController, updatePaymentStatusController } from "../controllers/payment.controller"; 
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

export default routes;
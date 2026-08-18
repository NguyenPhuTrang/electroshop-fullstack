import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { createOrderController } from "../controllers/order.controller";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createOrderController
);

export default router;
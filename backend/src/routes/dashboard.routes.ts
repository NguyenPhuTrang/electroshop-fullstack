import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";
import { getAdminDashboardController } from "../controllers/dashboard.controller";

const routes = Router();

routes.get(
    "/admin/dashboard",
    authMiddleware,
    requireRole("ADMIN"),
    getAdminDashboardController
);

export default routes;
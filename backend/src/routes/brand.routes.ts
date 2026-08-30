import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { createBrandController, deleteBrandController, getBrandByIdController, getBrandsController, updateBrandController } from "../controllers/brand.controller";

const routes = Router();

routes.post(
    "/",
    authMiddleware,
    createBrandController
);

routes.get(
    "/",
    authMiddleware,
    getBrandsController
);

routes.get(
    "/:id",
    authMiddleware,
    getBrandByIdController
);

routes.patch(
    "/:id",
    authMiddleware,
    updateBrandController
);

routes.delete(
    "/:id",
    authMiddleware,
    deleteBrandController
);

export default routes;
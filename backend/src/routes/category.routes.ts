import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { createCategoryController, deleteCategoryController, getCategoriesController, getCategoryByIdController, updateCategoryController } from "../controllers/category.controller";

const routes = Router();

routes.post(
"/",
authMiddleware,
createCategoryController
);

routes.get(
    "/",
    authMiddleware,
    getCategoriesController
);
routes.get(
    "/:id",
    authMiddleware,
    getCategoryByIdController
);
routes.patch(
    "/:id",
    authMiddleware,
    updateCategoryController
);
routes.delete(
    "/:id",
    authMiddleware,
    deleteCategoryController
)

export default routes;

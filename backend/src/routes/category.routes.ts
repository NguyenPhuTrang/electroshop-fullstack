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
    getCategoriesController
);
routes.get(
    "/:id",
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

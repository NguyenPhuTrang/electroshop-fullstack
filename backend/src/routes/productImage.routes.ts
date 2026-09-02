import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { createProductImageController, deleteProductImageController, getProductImageByIdController, getProductImagesController, updateProductImageController } from "../controllers/ProductImage.controller";

const routes = Router();

routes.post(
    "/:productId/images",
    authMiddleware,
    createProductImageController
);

routes.get(
   "/:productId/images",
    authMiddleware,
    getProductImagesController
);

routes.get(
    "/images/:id",
    authMiddleware,
    getProductImageByIdController
);

routes.patch(
   "/images/:id",
    authMiddleware,
    updateProductImageController
);

routes.delete(
     "/images/:id",
    authMiddleware,
    deleteProductImageController
);

export default routes;
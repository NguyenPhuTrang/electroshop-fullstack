import { Router } from "express";

import {
    addCartItemController,
    clearCartController,
    getCartController,
    removeCartItemController,
    updateCartItemController,
} from "../controllers/cart.controller";

import { authMiddleware } from "../middlewares/auth.middlesware";

const routes = Router();

routes.get(
    "/",
    authMiddleware,
    getCartController
);

routes.post(
    "/items",
    authMiddleware,
    addCartItemController
);

routes.patch(
    "/items/:cartItemId",
    authMiddleware,
    updateCartItemController
);

routes.delete(
    "/items/:cartItemId",
    authMiddleware,
    removeCartItemController
);

routes.delete(
    "/",
    authMiddleware,
    clearCartController
);

export default routes;
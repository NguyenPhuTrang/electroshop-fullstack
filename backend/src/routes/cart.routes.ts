import { Router } from "express";
import { addCartItemController, clearCartController, getCartController, updateCartItemController } from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { addCartItem, updateCartItem } from "../services/cart.service";

const routes =  Router();

routes.get(
    "/",
    authMiddleware,
    getCartController
)
routes.put(
    "/items/:productId",
    authMiddleware,
    updateCartItemController
)

routes.delete(
    "/",
    authMiddleware,
    clearCartController
)
routes.post(
    "/items",
    authMiddleware,
    addCartItemController
)
export default routes;
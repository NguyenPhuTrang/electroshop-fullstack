import { Router } from "express";
import { clearCartController, getCartController, updateCartItemController } from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { updateCartItem } from "../services/cart.service";

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
export default routes;
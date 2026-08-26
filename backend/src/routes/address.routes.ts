import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { createAddressController, deleteAddressController, getAddressByIdController, getAddressController, updateAddressController } from "../controllers/address.controller";

const routes = Router();

routes.post(
    "/",
    authMiddleware,
    createAddressController
);

routes.get(
    "/",
    authMiddleware,
    getAddressController
);

routes.get(
    "/:id",
    authMiddleware,
    getAddressByIdController
);

routes.patch(
    "/:id",
    authMiddleware,
    updateAddressController
);

routes.delete(
    "/:id",
    authMiddleware,
    deleteAddressController
)

export default routes;
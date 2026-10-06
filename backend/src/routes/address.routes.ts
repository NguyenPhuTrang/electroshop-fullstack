import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { createAddressController, deleteAddressController, getAddressByIdController, getAddressController, getAdminaddressesController, updateAddressController } from "../controllers/address.controller";
import { requireRole } from "../middlewares/role.middlewre";

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

routes.get(
    "/admin/users/:userId",
    authMiddleware,
    requireRole("ADMIN"),
    getAdminaddressesController
);

export default routes;
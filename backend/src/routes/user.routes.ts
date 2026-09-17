import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { changeMyPasswordController, getMyProfileController, UpdateMyProfileController } from "../controllers/user.controller";

const routes = Router();

routes.get(
  "/me",
  authMiddleware,
  getMyProfileController
);

routes.patch(
  "/me",
  authMiddleware,
  UpdateMyProfileController
);

routes.patch(
  "/me/password",
  authMiddleware,
  changeMyPasswordController
);

export default routes;
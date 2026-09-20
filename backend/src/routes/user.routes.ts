

import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { changeMyPasswordController, getMyProfileController, updateMyProfileController, uploadAvatarController } from "../controllers/user.controller";
import upload from "../middlewares/upload.middleware";

const routes = Router();

routes.get(
  "/me",
  authMiddleware,
  getMyProfileController
);

routes.patch(
  "/me",
  authMiddleware,
  updateMyProfileController
);

routes.patch(
  "/me/password",
  authMiddleware,
  changeMyPasswordController
);

routes.post(
  "/me/avatar",
  authMiddleware,
  upload.single("avatar"),
  uploadAvatarController
)
export default routes;
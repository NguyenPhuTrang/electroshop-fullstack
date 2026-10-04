

import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { changeMyPasswordController, getAdminUserByIdController, getAllUsersController, getMyProfileController, updateMyProfileController, updateUserStatusController, uploadAvatarController } from "../controllers/user.controller";
import upload from "../middlewares/upload.middleware";
import { requireRole } from "../middlewares/role.middlewre";

const routes = Router();

routes.get(
  "/me",
  authMiddleware,
  getMyProfileController
);

routes.get(
  "/admin",
  authMiddleware,
  requireRole("ADMIN"),
  getAllUsersController
);

routes.get(
  "/admin/:id",
  authMiddleware,
  requireRole("ADMIN"),
  getAdminUserByIdController
);

routes.patch(
  "/admin/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  updateUserStatusController
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
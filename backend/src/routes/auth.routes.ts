import { Router } from "express";
import { loginController, refreshTokenController, registerController, } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";

const router = Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/refresh-token", refreshTokenController);

router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "User information retrieved successfully",
        user: req.user,
    });
});

router.get(
    "/admin-test",
    authMiddleware,
    requireRole("ADMIN"),
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "You are an admin",
            user: req.user,
        });
    }
);

export default router;
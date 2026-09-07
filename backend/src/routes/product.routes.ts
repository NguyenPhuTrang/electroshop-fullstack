import { Router } from "express";
import { getProductsController, getProductByIdController, createProductController, updateProductController, deleteProductController, getProductBySlugController, } from "../controllers/product.controller";
import { authMiddleware } from "../middlewares/auth.middlesware";
import { requireRole } from "../middlewares/role.middlewre";

const router = Router();

router.get("/", getProductsController);

router.get("/slug/:slug", getProductBySlugController);

router.get("/:id",authMiddleware, getProductByIdController);

router.post("/", authMiddleware, requireRole("ADMIN"), createProductController);

router.put("/:id", authMiddleware, requireRole("ADMIN"), updateProductController);

router.delete("/:id", authMiddleware, requireRole("ADMIN"), deleteProductController); 


export default router;

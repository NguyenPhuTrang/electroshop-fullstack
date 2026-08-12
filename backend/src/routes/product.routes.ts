import { Router } from "express";
import { getProductsController, getProductByIdController, createProductController, updateProductController, deleteProductController, } from "../controllers/product.controller";

const router = Router();

router.get("/", getProductsController);

router.get("/:id", getProductByIdController);

router.post("/", createProductController);

router.put("/:id", updateProductController);

router.delete("/:id", deleteProductController); 

export default router;

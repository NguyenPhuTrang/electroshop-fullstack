import express from "express";
import productRoutes from "./routes/product.routes";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import reviewRoutes from "./routes/review.routes";
import addressRoutes from "./routes/address.routes";
import categoryRoutes from "./routes/category.routes";
import brandRoutes from "./routes/brand.routes";
import productImageRoutes from "./routes/productImage.routes";
import userRoutes from "./routes/user.routes";
import adminProductRoutes from "./routes/admin-product.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import productSpecificationRoutes from "./routes/productSpecification.routes";
import productVideoRoutes from "./routes/productVideo.routes";
import productVariantRoutes from "./routes/productVariant.routes";
import productColorRoutes from "./routes/productColor.routes";
import cors from "cors";

import {errorMiddleware} from "./middlewares/error.middleware"



const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/products", productImageRoutes);
app.use("/api/products", productRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", reviewRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", productSpecificationRoutes);
app.use("/api", productVideoRoutes);
app.use("/api", productVariantRoutes);
app.use("/api", productColorRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Product API",
    });
});

app.use(errorMiddleware);

export default app;

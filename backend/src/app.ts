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

const app = express();

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

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Product API",
    });
});

export default app;
import express from 'express';
import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes';
import cookieParser from "cookie-parser";
import cartRoutes from "./routes/cart.routes";
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/cart", cartRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product API',
  });
});


export default app;

import express from 'express';
import productRoutes from './routes/product.routes';
import authRoutes from './routes/auth.routes';
const app = express();
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product API',
  });
});


export default app;

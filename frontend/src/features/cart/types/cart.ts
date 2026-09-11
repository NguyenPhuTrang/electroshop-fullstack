export type CartProduct = {
  id: number;
  name: string;
  price: string;
  salePrice: string | null;
  stock: number;
};

export type CartItem = {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: CartProduct;
};

export type Cart = {
  id: number | null;
  userId: number;
  items: CartItem[];
};
export type CartProduct = {
  id: number;
  name: string;
  price: string;
  salePrice: string | null;
  stock: number;
};

export type Cart = {
  id: number | null;
  userId: number;
  items: CartItem[];
};

export type CartVariant = {
    id: number;
    price: string;
    salePrice: string | null;
    stock: number;
    status: string;
};

export type CartItem = {
    id: number;
    cartId: number;
    productId: number;
    variantId: number | null;
    quantity: number;
    product: CartProduct;
    variant: CartVariant | null;
};
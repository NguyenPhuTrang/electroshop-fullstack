export type PaymentMethod =
  | "COD"
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "VNPAY";

export type CreateOrderData = {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  note?: string;
  paymentMethod: PaymentMethod;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productSku: string;
  price: string;
  quantity: number;
  subtotal: string;
};

export type OrderPayment = {
  id: number;
  orderId: number;
  method: PaymentMethod;
  status: string;
  amount: string;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: number;
  userId: number;
  orderNumber: string;
  status: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  subtotal: string;
  shippingFee: string;
  discount: string;
  total: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment: OrderPayment | null;
};
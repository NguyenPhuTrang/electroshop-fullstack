"use client";

import {
  clearCart,
  getCart,
} from "@/src/features/cart/services/cart.service";
import CartItem from "@/src/features/cart/components/CartItem";
import type { Cart } from "@/src/features/cart/types/cart";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [requiresLogin, setRequiresLogin] = useState(false);
const [loadError, setLoadError] = useState(false);

  useEffect(() => {
  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        setRequiresLogin(true);
        return;
      }

      console.error("Failed to get cart", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  fetchCart();
}, []);

  const handleRemoveItem = (productId: number) => {
    if (!cart) return;

    setCart({
      ...cart,
      items: cart.items.filter(
        (item) => item.productId !== productId
      ),
    });
  };

  const handleQuantityChange = (
    productId: number,
    quantity: number
  ) => {
    if (!cart) return;

    setCart({
      ...cart,
      items: cart.items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
            }
          : item
      ),
    });
  };

  const handleClearCart = async () => {
    if (!cart) return;

    try {
      await clearCart();

      setCart({
        ...cart,
        items: [],
      });
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  };

  if (isLoading) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <p>Loading cart...</p>
    </main>
  );
}

if (requiresLogin) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <h1 className="text-3xl font-bold">
        My Cart
      </h1>

      <p className="mt-6">
        Please log in to view your cart.
      </p>

      <Link
        href="/login"
        className="mt-4 inline-block rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
      >
        Log In
      </Link>
    </main>
  );
}

if (loadError || !cart) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <h1 className="text-3xl font-bold">
        My Cart
      </h1>

      <p className="mt-6 text-red-600">
        Failed to load your cart. Please try again later.
      </p>
    </main>
  );
}

  const total = cart.items.reduce((sum, item) => {
    const price = Number(
      item.product.salePrice ?? item.product.price
    );

    return sum + price * item.quantity;
  }, 0);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold">
        My Cart
      </h1>

      {cart.items.length > 0 && (
        <button
          type="button"
          onClick={handleClearCart}
          className="mt-4 rounded bg-red-500 px-4 py-2 text-white"
        >
          Clear Cart
        </button>
      )}

      {cart.items.length === 0 ? (
        <p className="mt-6">
          Your cart is empty.
        </p>
      ) : (
        <div className="mt-6">
          {cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={handleRemoveItem}
              onQuantityChange={handleQuantityChange}
            />
          ))}

          <div className="mt-6 border-t pt-4 text-right">
            <p className="text-xl font-bold">
              Total: {total.toLocaleString("vi-VN")} VND
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
"use client";

import { clearCart, getCart } from "@/src/features/cart/services/cart.service";
import CartItem from "@/src/features/cart/components/CartItem";
import type { Cart } from "@/src/features/cart/types/cart";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();

        console.log("Cart", data);

        setCart(data);
      } catch (error) {
        console.error("Failed to get cart", error);
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

  if (!cart) {
    return <p className="p-6">Loading...</p>;
  }

    const handleClearCart = async () => {
    try {
        await clearCart();

        setCart({
        ...cart!,
        items: [],
        });
    } catch (error) {
        console.error("Failed to clear cart", error);
    }
    };

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
            />
          ))}
        </div>
      )}
            {cart.items.length > 0 && (
                <div className="mt-6 border-t pt-4 text-right">
                    <p className="text-xl font-bold">
                    Total: {total.toLocaleString("vi-VN")} VND
                    </p>
                </div>
            )}
    </main>
  );
}
"use client";

import {
  createContext, useCallback, useContext, useEffect, useState,
  type Dispatch, type SetStateAction, type ReactNode,
} from "react";
import { motion } from "motion/react";
import { getCart } from "@/src/features/cart/services/cart.service";
import type { Cart } from "@/src/features/cart/types/cart";

type Flight = {
  id: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  size: number;
  image: string | null;
  quantity: number;
};

type CartContextValue = {
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
  flyToCart: (source: HTMLElement, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);

  // Lấy số lượng ban đầu (chưa đăng nhập thì giữ 0)
  useEffect(() => {
    getCart()
      .then((cart: Cart) =>
        setCount(cart.items.reduce((sum, item) => sum + item.quantity, 0))
      )
      .catch(() => setCount(0));
  }, []);

  const flyToCart = useCallback((source: HTMLElement, quantity: number) => {
    const target = document.querySelector<HTMLElement>("[data-cart-icon]");

    // Không thấy biểu tượng giỏ thì cộng thẳng, bỏ hiệu ứng
    if (!target) {
      setCount((c) => c + quantity);
      return;
    }

    const s = source.getBoundingClientRect();
    const t = target.getBoundingClientRect();

    const img = source.querySelector("img");
    const image = img ? img.currentSrc || img.src : null;

    setFlights((list) => [
    ...list,
    {
        id: Date.now() + Math.random(),
        sx: s.left + s.width / 2,
        sy: s.top + s.height / 2,
        tx: t.left + t.width / 2,
        ty: t.top + t.height / 2,
        size: image ? Math.min(s.width, s.height) * 0.6 : 24,
        image,
        quantity,
    },
    ]);
  }, []);

  const finishFlight = (flight: Flight) => {
    setFlights((list) => list.filter((f) => f.id !== flight.id));
    setCount((c) => c + flight.quantity);
  };

  return (
    <CartContext.Provider value={{ count, setCount, flyToCart }}>
      {children}

      {flights.map((f) => (
        <motion.div
            key={f.id}
            aria-hidden="true"
            className="pointer-events-none fixed left-0 top-0 z-[100] overflow-hidden rounded-xl bg-white shadow-lg"
            style={
            f.image
                ? {
                    backgroundImage: `url("${f.image}")`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                }
                : { backgroundColor: "#2563eb", borderRadius: 9999 }
            }
            initial={{
            x: f.sx - f.size / 2,
            y: f.sy - f.size / 2,
            width: f.size,
            height: f.size,
            opacity: 1,
            }}
            animate={{
            x: f.tx - 12,
            y: f.ty - 12,
            width: 24,
            height: 24,
            opacity: 0.6,
            }}
            transition={{
            x: { duration: 0.8, ease: "linear" },
            y: { duration: 0.8, ease: "easeIn" },
            width: { duration: 0.8, ease: "easeIn" },
            height: { duration: 0.8, ease: "easeIn" },
            opacity: { duration: 0.8 },
            }}
            onAnimationComplete={() => finishFlight(f)}
        />
        ))}
    </CartContext.Provider>
  );
}
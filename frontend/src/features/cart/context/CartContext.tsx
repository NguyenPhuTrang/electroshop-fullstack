
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
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
  generation: number;
};

type CartContextValue = {
  count: number;
  setCount: Dispatch<SetStateAction<number>>;
  flyToCart: (source: HTMLElement, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);

  // Track API requests to prevent outdated responses.
  const requestIdRef = useRef(0);

  // Track animation generations to prevent old animations
  // from updating the cart after Logout.
  const flightGenerationRef = useRef(0);

  const refreshCart = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;

    try {
      const cart: Cart = await getCart();

      // Ignore outdated API responses.
      if (requestId !== requestIdRef.current) {
        return;
      }

      const totalQuantity = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setCount(totalQuantity);
    } catch {
      // Ignore errors from outdated requests.
      if (requestId !== requestIdRef.current) {
        return;
      }

      // No authenticated cart or unable to load cart.
      setCount(0);
    }
  }, []);

  // Load cart when CartProvider is mounted.
  useEffect(() => {
    void refreshCart();

    return () => {
      // Invalidate pending API requests on unmount.
      requestIdRef.current += 1;

      // Invalidate pending animations on unmount.
      flightGenerationRef.current += 1;
    };
  }, [refreshCart]);

  const clearCart = useCallback(() => {
    // Invalidate previous API requests.
    requestIdRef.current += 1;

    // Invalidate previous animation callbacks.
    flightGenerationRef.current += 1;

    // Reset client-side cart state.
    setCount(0);
    setFlights([]);
  }, []);

  const flyToCart = useCallback(
    (source: HTMLElement, quantity: number) => {
      // Validate quantity.
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return;
      }

      const target =
        document.querySelector<HTMLElement>("[data-cart-icon]");

      // If cart icon is unavailable, update count directly.
      if (!target) {
        setCount((current) => current + quantity);
        return;
      }

      const sourceRect = source.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const img = source.querySelector("img");
      const image = img ? img.currentSrc || img.src : null;

      const flight: Flight = {
        id: Date.now() + Math.random(),
        sx: sourceRect.left + sourceRect.width / 2,
        sy: sourceRect.top + sourceRect.height / 2,
        tx: targetRect.left + targetRect.width / 2,
        ty: targetRect.top + targetRect.height / 2,
        size: image
          ? Math.min(sourceRect.width, sourceRect.height) * 0.6
          : 24,
        image,
        quantity,
        generation: flightGenerationRef.current,
      };

      setFlights((list) => [...list, flight]);
    },
    []
  );


  const finishFlight = useCallback((flight: Flight) => {
    // Remove completed animation.
    setFlights((list) =>
      list.filter((item) => item.id !== flight.id)
    );

    // Ignore animations belonging to an old cart session.
    if (flight.generation !== flightGenerationRef.current) {
      return;
    }

    // Update cart badge.
    setCount((current) => current + flight.quantity);
  }, []);


  return (
    <CartContext.Provider
      value={{
        count,
        setCount,
        flyToCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}

      {/* Product flying animations */}
      {flights.map((flight) => (
        <motion.div
          key={flight.id}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[100] overflow-hidden rounded-xl bg-white shadow-lg"
          style={
            flight.image
              ? {
                  backgroundImage: `url("${flight.image}")`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }
              : {
                  backgroundColor: "#2563eb",
                  borderRadius: 9999,
                }
          }
          initial={{
            x: flight.sx - flight.size / 2,
            y: flight.sy - flight.size / 2,
            width: flight.size,
            height: flight.size,
            opacity: 1,
          }}
          animate={{
            x: flight.tx - 12,
            y: flight.ty - 12,
            width: 24,
            height: 24,
            opacity: 0.6,
          }}
          transition={{
            x: {
              duration: 0.8,
              ease: "linear",
            },
            y: {
              duration: 0.8,
              ease: "easeIn",
            },
            width: {
              duration: 0.8,
              ease: "easeIn",
            },
            height: {
              duration: 0.8,
              ease: "easeIn",
            },
            opacity: {
              duration: 0.8,
            },
          }}
          onAnimationComplete={() => finishFlight(flight)}
        />
      ))}
    </CartContext.Provider>
  );
}

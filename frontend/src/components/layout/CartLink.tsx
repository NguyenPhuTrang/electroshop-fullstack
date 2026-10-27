"use client";

import { motion } from "motion/react";
import { Link } from "@/src/i18n/navigation";
import { useCart } from "@/src/features/cart/context/CartContext";

const navLinkClassName =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export default function CartLink({ label }: { label: string }) {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={label}
      className={`${navLinkClassName} inline-flex items-center gap-1.5`}
    >
      <span data-cart-icon className="relative inline-flex">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" />
          <circle cx="10" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>

        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 1.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -right-1.5 -top-1.5 flex h-3 min-w-3 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold leading-none text-white"
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
      </span>

      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
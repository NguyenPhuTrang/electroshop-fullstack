"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@/src/i18n/navigation";

type MobileMenuProps = {
  menuLabel: string;
  homeLabel: string;
  productsLabel: string;
  children: ReactNode;
};

const mobileLinkClassName =
  "block rounded-lg px-3 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700";

export default function MobileMenu({
  menuLabel,
  homeLabel,
  productsLabel,
  children,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={menuLabel}
        className="flex size-11 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="size-6"
          aria-hidden="true"
        >
          {isOpen ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-0 top-full border-b border-slate-200 bg-white px-3 py-3 shadow-md"
          >
            <nav aria-label={menuLabel}>
              <ul className="space-y-1">
                <li>
                  <Link href="/" onClick={close} className={mobileLinkClassName}>
                    {homeLabel}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products"
                    onClick={close}
                    className={mobileLinkClassName}
                  >
                    {productsLabel}
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="mt-3 flex items-center gap-3 border-t border-slate-100 px-1 pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
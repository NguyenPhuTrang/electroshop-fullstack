"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import LogoutButton from "../../auth/components/LogoutButton";
import { useUser } from "@/src/hooks/useUser";

export default function UserMenu() {
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  console.log("UserMenu user:", user);
  
  return (
  <>
    {loading ? (
      // 1. Đang tải thông tin tài khoản
      <div
        className="h-8 w-24 animate-pulse rounded bg-gray-100"
        aria-hidden="true"
      />
    ) : !user ? (
      // 2. Chưa đăng nhập
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="hover:underline"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded bg-black px-3 py-2 text-white hover:bg-gray-800"
        >
          Register
        </Link>
      </div>
    ) : (
      // 3. Đã đăng nhập
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <span>{user.name}</span>

          <span>▾</span>
        </button>

      {isOpen && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded border bg-white p-2 shadow-lg">

              {user.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block rounded px-3 py-2 hover:bg-gray-100"
                  >
                    Admin Manager
                  </Link>

                </>
              )}

              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="block rounded px-3 py-2 hover:bg-gray-100"
              >
                My Account
              </Link>

              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="block rounded px-3 py-2 hover:bg-gray-100"
              >
                Orders
              </Link>

              <div className="mt-1 border-t pt-1">
                <LogoutButton />
              </div>
            </div>
          )}
      </div>
    )}
  </>
);
}
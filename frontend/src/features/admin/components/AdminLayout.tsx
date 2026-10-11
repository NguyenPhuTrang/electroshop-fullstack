"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/src/hooks/useUser";

import AdminFooter from "./AdminFooter";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [loading, user, router]);

  // Wait until authentication and role checks are complete.
  if (loading || !user || user.role !== "ADMIN") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p>Checking admin access...</p>
      </main>
    );
  }

  // Render the Admin Manager only for ADMIN accounts.
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminHeader />

        <main className="flex-1 p-6">
          {children}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
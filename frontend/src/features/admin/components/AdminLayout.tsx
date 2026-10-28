"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/src/i18n/navigation";

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

  // Sidebar drawer (mobile/tablet only; on desktop it is always visible).
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Drawer: close with Esc, lock page scroll while open,
  // and close automatically when the screen grows to desktop size.
  useEffect(() => {
    if (!isSidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };

    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const handleDesktopChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleDesktopChange);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleDesktopChange);
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

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
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* min-w-0 lets wide tables scroll inside the page instead of stretching it */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="min-w-0 flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}
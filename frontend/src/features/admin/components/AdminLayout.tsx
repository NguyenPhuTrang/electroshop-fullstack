import AdminFooter from "./AdminFooter";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
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
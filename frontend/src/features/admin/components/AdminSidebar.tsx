import Link from "next/link";

export default function AdminSidebar() {
    return (
    <aside className="w-64 border-r bg-white">
      <div className="p-6">
        <h2 className="text-xl font-bold">
          Admin Panel
        </h2>
      </div>

      <nav className="px-4">
        <div className="space-y-1">
          <Link
            href="/admin"
            className="block rounded px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/products"
            className="block rounded px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Products
          </Link>

          <Link
            href="/admin/orders"
            className="block rounded px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Orders
          </Link>

          <Link
            href="/admin/users"
            className="block rounded px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Users
          </Link>

          <Link
            href="/admin/reviews"
            className="block rounded px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Reviews
          </Link>
        </div>
      </nav>
    </aside>
  );
}
    

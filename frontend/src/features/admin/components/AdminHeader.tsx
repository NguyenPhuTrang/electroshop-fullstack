
export default function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="text-xl font-semibold">
        Admin Panel
      </h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Admin
        </span>
      </div>
    </header>
  );
}
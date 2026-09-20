
import UserMenu from "@/src/features/user/components/userMenu";
import Link from "next/link";


export default function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold"
        >
          Electroshop
        </Link>

        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <Link href="/">
                Home
              </Link>
            </li>

            <li>
              <Link href="/products">
                Products
              </Link>
            </li>

            <li>
              <Link href="/cart">
                Cart
              </Link>
            </li>

            <li>
              <UserMenu />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
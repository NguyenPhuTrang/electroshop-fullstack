import UserMenu from "@/src/features/user/components/userMenu";
import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../languages/LanguageSwitcher";

const navLinkClassName =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export default function Header() {
  const t = useTranslations("Header");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-3 sm:px-4 lg:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg"
          aria-label={t("homeAria")}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-colors duration-200 group-hover:bg-blue-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M13 2 4 14h7l-1 8 10-12h-7l1-8Z" />
            </svg>
          </span>

          <span className="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 sm:text-xl">
            Electroshop
          </span>
        </Link>

        {/* Navigation */}
        <nav aria-label={t("navAria")}>
          <ul className="flex items-center gap-1 sm:gap-2">
            <li>
              <Link href="/" className={navLinkClassName}>
                {t("home")}
              </Link>
            </li>

            <li>
              <Link href="/products" className={navLinkClassName}>
                {t("products")}
              </Link>
            </li>

            <li>
              <Link
                href="/cart"
                className={`${navLinkClassName} inline-flex items-center gap-1.5`}
              >
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

                <span>{t("cart")}</span>
              </Link>
            </li>

            <li className="ml-1 border-l border-slate-200 pl-2 sm:ml-2 sm:pl-3">
              <LanguageSwitcher />
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
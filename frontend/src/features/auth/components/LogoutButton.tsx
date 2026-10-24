"use client";

import { useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { logout } from "../services/auth.service";
import { clearAccessToken } from "../services/auth-token";
import { useUser } from "@/src/hooks/useUser";

export default function LogoutButton() {
    const t = useTranslations("LogoutButton");
    const router = useRouter();
    const { setUser } = useUser(); // lấy hàm setUser ra khỏi UserProvider để LogoutButton có thể thay đổi state user.

    const handleLogout = async () => {
        try {
            await logout();

            clearAccessToken();
            setUser(null);

            router.push("/login");
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors duration-200">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                >
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                </svg>
            </span>

            {t("logout")}
        </button>
    );
}
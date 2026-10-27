"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import { logout } from "../services/auth.service";
import { clearAccessToken } from "../services/auth-token";
import { useUser } from "@/src/hooks/useUser";

export default function LogoutButton() {
    const t = useTranslations("LogoutButton");
    const router = useRouter();
    const { setUser } = useUser(); // lấy hàm setUser ra khỏi UserProvider để LogoutButton có thể thay đổi state user.

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Đóng hộp thoại bằng phím Esc (không cho đóng khi đang đăng xuất).
    useEffect(() => {
        if (!isConfirmOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isLoggingOut) {
                setIsConfirmOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isConfirmOpen, isLoggingOut]);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            await logout();

            clearAccessToken();
            setUser(null);
            setIsConfirmOpen(false);

            router.push("/login");
        } catch (error) {
            console.error("Failed to logout", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
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

            {isConfirmOpen &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 px-4"
                        onMouseDown={(event) => {
                            event.stopPropagation();
                            if (event.target === event.currentTarget && !isLoggingOut) {
                                setIsConfirmOpen(false);
                            }
                        }}
                    >
                        <div
                            role="alertdialog"
                            aria-modal="true"
                            aria-labelledby="logout-confirm-title"
                            aria-describedby="logout-confirm-description"
                            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl"
                        >
                            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="size-6"
                                    aria-hidden="true"
                                >
                                    <path d="M10 17l5-5-5-5" />
                                    <path d="M15 12H3" />
                                    <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                                </svg>
                            </div>

                            <h2
                                id="logout-confirm-title"
                                className="mt-4 text-lg font-semibold text-slate-900"
                            >
                                {t("confirmTitle")}
                            </h2>

                            <p
                                id="logout-confirm-description"
                                className="mt-2 text-sm leading-6 text-slate-500"
                            >
                                {t("confirmDescription")}
                            </p>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmOpen(false)}
                                    disabled={isLoggingOut}
                                    className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {t("cancel")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => void handleLogout()}
                                    disabled={isLoggingOut}
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isLoggingOut ? (
                                        <>
                                            <span
                                                aria-hidden="true"
                                                className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                            />
                                            {t("loggingOut")}
                                        </>
                                    ) : (
                                        t("confirm")
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}
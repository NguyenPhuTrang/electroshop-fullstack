
"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter as useLocalizedRouter } from "@/src/i18n/navigation";
import { useRouter as useNextRouter } from "next/navigation";
import { toast } from "sonner";

import { setAccessToken } from "@/src/features/auth/services/auth-token";
import { login } from "@/src/features/auth/services/auth.service";
import { useUser } from "@/src/hooks/useUser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = useTranslations("Login");

  // Preserve the active locale for storefront navigation.
  const localizedRouter = useLocalizedRouter();

  // Admin pages remain outside locale-based routing.
  const router = useNextRouter();

  const { setUser } = useUser();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    const toastId = toast.loading(t("toastLoading"));

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      setAccessToken(result.data.accessToken);
      setUser(result.data.user);

      toast.success(t("toastSuccess"), {
        id: toastId,
      });

      if (result.data.user.role === "ADMIN") {
        router.replace("/admin");
      } else {
        localizedRouter.replace("/");
      }
    } catch (error) {
      console.error("Login failed:", error);

      toast.error(t("toastError"), {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 sm:px-6">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-100/70 via-blue-50/40 to-transparent"
      />

      <main className="relative z-0 w-full max-w-md">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/[0.04] sm:p-9">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                className="size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m16-11V3m-4 4h8M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                />
              </svg>
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t("title")}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {t("description")}
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                {t("emailLabel")}
              </label>

              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("emailPlaceholder")}
                required
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                {t("passwordLabel")}
              </label>

              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("passwordPlaceholder")}
                required
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  {t("submitting")}
                </>
              ) : (
                <>
                  {t("submit")}

                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14m-6-6 6 6-6 6"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-7 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs leading-5 text-slate-500">
              {t("footerNote")}
            </p>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Electroshop
        </p>
      </main>
    </div>
  );
}

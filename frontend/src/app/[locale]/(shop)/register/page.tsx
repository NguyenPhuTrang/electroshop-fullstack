
"use client";

import axios from "axios";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  Link,
  useRouter,
} from "@/src/i18n/navigation";
import { register } from "@/src/features/auth/services/auth.service";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = useTranslations("Register");
  const router = useRouter();

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (password !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }

    setIsSubmitting(true);

    const toastId = toast.loading(t("toastLoading"));

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      toast.success(t("toastSuccess"), {
        id: toastId,
        description: t("toastSuccessDescription"),
      });

      router.push("/login");
    } catch (error: unknown) {
      let errorMessage = t("toastError");

      if (axios.isAxiosError<{ message?: string }>(error)) {
        errorMessage = error.response?.data?.message ?? errorMessage;
      }

      toast.error(errorMessage, {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

  const labelClassName =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 sm:px-6">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-100/70 via-blue-50/40 to-transparent"
      />

      <div className="relative z-0 w-full max-w-md">
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

          {/* Register form */}
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label
                htmlFor="register-name"
                className={labelClassName}
              >
                {t("nameLabel")}
              </label>

              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                autoComplete="name"
                placeholder={t("namePlaceholder")}
                required
                disabled={isSubmitting}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className={labelClassName}
              >
                {t("emailLabel")}
              </label>

              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder={t("emailPlaceholder")}
                required
                disabled={isSubmitting}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="register-password"
                className={labelClassName}
              >
                {t("passwordLabel")}
              </label>

              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                autoComplete="new-password"
                placeholder={t("passwordPlaceholder")}
                required
                disabled={isSubmitting}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="register-confirm-password"
                className={labelClassName}
              >
                {t("confirmPasswordLabel")}
              </label>

              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                minLength={6}
                autoComplete="new-password"
                placeholder={t("confirmPasswordPlaceholder")}
                required
                disabled={isSubmitting}
                className={inputClassName}
              />
            </div>

            <div>
              <label
                htmlFor="register-avatar"
                className={labelClassName}
              >
                {t("avatarLabel")}
                <span className="ml-1 font-normal text-slate-400">
                  {t("optional")}
                </span>
              </label>

              <input
                id="register-avatar"
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder={t("avatarPlaceholder")}
                disabled={isSubmitting}
                className={inputClassName}
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

          {/* Sign-in link */}
          <div className="mt-7 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-500">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-700 transition-colors hover:text-blue-800"
              >
                {t("signIn")}
              </Link>
            </p>
          </div>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          © {new Date().getFullYear()} Electroshop · {t("footerNote")}
        </p>
      </div>
    </main>
  );
}

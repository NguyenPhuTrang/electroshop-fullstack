
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState, type FormEvent } from "react";

import { register } from "@/src/features/auth/services/auth.service";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleRegister = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        avatarUrl: avatarUrl.trim() || undefined,
      });

      router.push("/login");
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        setError(
          error.response?.data?.message ??
            "Registration failed. Please try again."
        );
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

  const labelClassName =
    "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f8fa] px-4 py-10 sm:py-14">
      <div className="w-full max-w-md">
        {/* Register Card */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-blue-600">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2m16-11V3m-4 4h8M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                />
              </svg>
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Create Account
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Join Electroshop and start shopping today.
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="register-name"
                className={labelClassName}
              >
                Full Name
              </label>

              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                minLength={2}
                autoComplete="name"
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
                className={inputClassName}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
                className={labelClassName}
              >
                Email Address
              </label>

              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                autoComplete="email"
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className={inputClassName}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
                className={labelClassName}
              >
                Password
              </label>

              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                minLength={6}
                autoComplete="new-password"
                placeholder="Create a password"
                required
                disabled={isSubmitting}
                className={inputClassName}
              />

            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className={labelClassName}
              >
                Confirm Password
              </label>

              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setError("");
                }}
                minLength={6}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
                disabled={isSubmitting}
                className={inputClassName}
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label
                htmlFor="register-avatar"
                className={labelClassName}
              >
                Avatar URL
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="register-avatar"
                type="url"
                value={avatarUrl}
                onChange={(event) => {
                  setAvatarUrl(event.target.value);
                  setError("");
                }}
                placeholder="Image URL"
                disabled={isSubmitting}
                className={inputClassName}
              />

            </div>

            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm leading-5 text-rose-700"
              >
                <div className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="font-semibold"
                  >
                    !
                  </span>

                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account

                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
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

          {/* Login Link */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-700 transition-colors hover:text-blue-800"
              >
                Sign In
              </Link>
            </p>
          </div>
        </section>

        <p className="mt-4 text-center text-xs leading-5 text-slate-400">
          Create your account to manage your profile and orders.
        </p>
      </div>
    </main>
  );
}

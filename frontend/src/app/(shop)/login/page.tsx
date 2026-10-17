"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setAccessToken } from "@/src/features/auth/services/auth-token";
import { login } from "@/src/features/auth/services/auth.service";
import { useUser } from "@/src/hooks/useUser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { setUser } = useUser();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    // Show loading notification
    const toastId = toast.loading("Signing in...");

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      setAccessToken(result.data.accessToken);
      setUser(result.data.user);

      // Update loading notification to success
      toast.success("Signed in successfully!", {
        id: toastId,
      });

      if (result.data.user.role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch (error) {
      console.error("Login failed:", error);

      // Update loading notification to error
      toast.error(
        "Unable to sign in. Please check your email and password and try again.",
        {
          id: toastId,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f8fa] px-4 py-10 sm:py-14">
      <div className="w-full max-w-md">
        {/* Login Card */}
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
              Welcome ~~~
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to your Electroshop account to continue.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>

              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                required
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

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
                  Signing In...
                </>
              ) : (
                <>
                  Sign In

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

          {/* Footer */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs leading-5 text-slate-500">
              Sign in to manage your account and track your orders.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
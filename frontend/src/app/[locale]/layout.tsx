import type { Metadata } from "next"; // Root Layout toàn bộ ứng dụng
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import "../globals.css";

import AuthProvider from "@/src/features/auth/components/AuthProvider";
import { UserProvider } from "@/src/contexts/UserContext";
import { routing } from "@/src/i18n/routing";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Electroshop",
  description: "Electroshop - Online Electronics Store",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <NextIntlClientProvider>
          <AuthProvider>
            <UserProvider>{children}</UserProvider>
          </AuthProvider>

          <Toaster
            position="top-right"
            offset={{ top: 80, right: 24 }}
            mobileOffset={{ top: 72, right: 16 }}
            duration={4000}
            closeButton
            visibleToasts={3}
            gap={10}
            icons={{
              success: (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                </span>
              ),
              error: (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-5"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" d="M12 8v5m0 3h.01" />
                  </svg>
                </span>
              ),
              warning: (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"
                    />
                    <path strokeLinecap="round" d="M12 9v4m0 3h.01" />
                  </svg>
                </span>
              ),
              info: (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-5"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" d="M12 11v5m0-8h.01" />
                  </svg>
                </span>
              ),
              loading: (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-5 animate-spin"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-20"
                    />
                    <path
                      d="M21 12a9 9 0 0 0-9-9"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              ),
              close: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m18 6-12 12M6 6l12 12"
                  />
                </svg>
              ),
            }}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "relative flex w-full max-w-[380px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 pr-11 text-slate-700 shadow-[0_14px_40px_-16px_rgba(15,23,42,0.25)]",
                title: "text-sm font-semibold leading-5 text-slate-900",
                description: "mt-1 text-xs leading-5 text-slate-500",
                icon: "shrink-0",
                loader: "!static !flex !h-auto !w-auto !transform-none",
                closeButton:
                  "absolute right-3 top-3 flex size-7 items-center justify-center rounded-lg border border-transparent bg-white text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700",
                success: "border-emerald-200 border-l-4 border-l-emerald-500",
                error: "border-rose-200 border-l-4 border-l-rose-500",
                warning: "border-amber-200 border-l-4 border-l-amber-500",
                info: "border-blue-200 border-l-4 border-l-blue-600",
                loading: "border-cyan-200 border-l-4 border-l-cyan-500",
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
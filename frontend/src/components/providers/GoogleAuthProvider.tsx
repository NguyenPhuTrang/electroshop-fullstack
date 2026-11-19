
"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function GoogleAuthProvider({ children }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const locale = useLocale();

  if (!clientId) {
    throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID");
  }

  const googleLocale =
    locale === "zh-TW"
      ? "zh-TW"
      : locale === "vi"
        ? "vi"
        : "en";

  return (
    <GoogleOAuthProvider
      clientId={clientId}
      locale={googleLocale}
    >
      {children}
    </GoogleOAuthProvider>
  );
}

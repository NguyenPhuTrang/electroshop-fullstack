
"use client";

import { useEffect, useState, type ReactNode } from "react";

import api from "@/src/lib/axios";
import { clearAccessToken, setAccessToken } from "@/src/features/auth/services/auth-token";

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const response = await api.post("/auth/refresh-token");

        setAccessToken(response.data.data.accessToken);
      } catch {
        clearAccessToken();
      } finally {
        setIsReady(true);
      }
    };

    bootstrapAuth();
  }, []);

  if (!isReady) return null;

  return <>{children}</>;
}

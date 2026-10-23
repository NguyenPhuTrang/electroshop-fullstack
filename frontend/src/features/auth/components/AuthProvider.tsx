"use client"; // khôi phục trạng thái đăng nhập mỗi khi trang được tải lại.

import { useEffect, useState } from "react";
import axios from "axios";
import { setAccessToken } from "@/src/features/auth/services/auth-token";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
       const res = await axios.post(
          "/api/auth/refresh-token",
          {},
          { withCredentials: true }
        );
        setAccessToken(res.data.data.accessToken);
      } catch {
       
      } finally {
        setIsReady(true);
      }
    };

    bootstrapAuth();
  }, []);

  if (!isReady) return null; 

  return <>{children}</>;
}
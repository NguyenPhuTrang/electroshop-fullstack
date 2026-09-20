"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import axios from "axios";
import type { User } from "@/src/features/user/types/user";
import { getMyProfile } from "@/src/features/user/services/user.service";

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setUser(data);
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.status === 401
      ) {
        setUser(null);
        return;
      }

      console.error("Failed to get current user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

    useEffect(() => {
        let ignore = false;

        getMyProfile()
          .then((data) => {
            if (!ignore) setUser(data);
          })
          .catch(() => {
            if (!ignore) setUser(null);
          })
          .finally(() => {
            if (!ignore) setLoading(false);
          });

        return () => {
          ignore = true;
        };
    }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
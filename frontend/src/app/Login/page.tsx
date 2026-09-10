"use client";

import { getAccessToken, setAccessToken } from "@/src/features/auth/services/auth-token";
import { login } from "@/src/features/auth/services/auth.service";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleLogin = async () => {
      try {
      const result = await login({
        email,
        password,
      });

      console.log("accessToken received:", result.data.accessToken);
      setAccessToken(result.data.accessToken);
      console.log("accessToken after set:", getAccessToken()); 

      router.push("/");

    }catch (error){
      console.error("Login failed", error)
    }



};
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-3xl font-bold">
        Login
      </h1>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <div>
          <label className="mb-1 block">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border p-2"
          />
        </div>

        <button
            onClick={handleLogin}
            type="button"
            className="w-full rounded bg-black px-4 py-2 text-white"
        >
          Login
        </button>
      </div>
    </main>
  );
}
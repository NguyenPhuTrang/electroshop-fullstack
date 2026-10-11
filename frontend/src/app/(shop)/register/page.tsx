"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useState, type FormEvent } from "react";
import { register } from "@/src/features/auth/services/auth.service";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const router = useRouter();

  const handleRegister = async (
    event: FormEvent<HTMLFormElement> // FormEvent Kiểu sự kiện trong React, dùng để mô tả sự kiện liên quan đến form.
  ) => {
    event.preventDefault();
    setError("");
    if(password !== confirmPassword){
      setError("Passwords do not match !");
      return;
    }
    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        avatarUrl: avatarUrl.trim() || undefined
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

 return (
  <main className="mx-auto max-w-md p-6">
    <h1 className="text-3xl font-bold">
      Create Account
    </h1>

    <p className="mt-2 text-gray-600">
      Create your Electroshop account.
    </p>

    <form
      onSubmit={handleRegister}
      className="mt-6 space-y-4"
    >
      {/* Full Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-1 block"
        >
          Full Name
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          autoComplete="name"
          required
          className="w-full rounded border p-2"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1 block"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="w-full rounded border p-2"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-1 block"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          autoComplete="new-password"
          required
          className="w-full rounded border p-2"
        />
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1 block"
        >
          Confirm Password
        </label>

        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={6}
          autoComplete="new-password"
          required
          className="w-full rounded border p-2"
        />
      </div>

      {/* Avatar URL */}
      <div>
        <label
          htmlFor="avatarUrl"
          className="mb-1 block"
        >
          Avatar URL (Optional)
        </label>

        <input
          id="avatarUrl"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          className="w-full rounded border p-2"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Creating Account..."
          : "Create Account"}
      </button>
    </form>

    <p className="mt-4 text-center text-sm">
      Already have an account?{" "}
      <Link
        href="/login"
        className="font-medium underline"
      >
        Login
      </Link>
    </p>
  </main>
);
}
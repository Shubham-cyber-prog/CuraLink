"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordInput } from "./PasswordInput";
import { AuthError } from "./AuthError";

interface LoginFormProps {
  onSuccess?: (user: Record<string, unknown>, token: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";
    if (!password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      const { token, user } = data;

      if (token) {
        if (rememberMe) {
          localStorage.setItem("curalink_token", token);
        } else {
          sessionStorage.setItem("curalink_token", token);
        }
      }

      if (onSuccess) {
        onSuccess(user, token);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-500 font-normal">Sign in to your CuraLink account</p>
      </div>

      <AuthError message={error} />

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
            fieldErrors.email ? "border-red-300" : "border-slate-200"
          }`}
        />
        {fieldErrors.email && (
          <span className="text-xs text-red-600 font-medium">{fieldErrors.email}</span>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <PasswordInput
          label="Password"
          id="login-password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
          error={fieldErrors.password}
        />
        <div className="flex justify-end pt-1">
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      {/* Remember Me */}
      <label className="flex items-center gap-2.5 cursor-pointer group select-none">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
        <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Remember me</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition-all duration-200 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-teal-700"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Signing you in...</span>
          </>
        ) : (
          "Log in"
        )}
      </button>

      {/* Sign up link */}
      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
          Create account
        </Link>
      </p>
    </form>
  );
}

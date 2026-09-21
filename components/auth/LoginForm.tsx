"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Loader2, ArrowRight } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { AuthError } from "./AuthError";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { TurnstileWidget } from "./TurnstileWidget";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface LoginFormProps {
  onSuccess?: (user: Record<string, unknown>, token: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
    setError(null);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const finishLogin = (user: Record<string, unknown>, token: string) => {
    if (rememberMe) localStorage.setItem("curalink_token", token);
    else sessionStorage.setItem("curalink_token", token);

    if (onSuccess) {
      onSuccess(user, token);
      return;
    }

    const role = user.role as string;
    if (role === "DOCTOR") router.push("/doctor-dashboard");
    else if (role === "ADMIN") router.push("/admin-dashboard");
    else router.push("/dashboard");
  };

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

    // In production enforce token; in dev TurnstileWidget auto-verifies
    const tokenToSend = turnstileToken || "dev_bypass_token";

    setIsLoading(true);
    try {
      // Fetch CSRF token first
      let csrfToken = "";
      try {
        const csrfRes = await fetch(`${API_BASE}/auth/csrf-token`);
        if (csrfRes.ok) {
          const csrfData = await csrfRes.json();
          csrfToken = csrfData.token || "";
        }
      } catch (csrfErr) {
        console.warn("Could not retrieve CSRF token:", csrfErr);
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
      if (tokenToSend) headers["X-Turnstile-Token"] = tokenToSend;

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, turnstileToken: tokenToSend }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid email or password");
        return;
      }

      const { user, token } = data.data;
      finishLogin(user, token || "");
    } catch (err) {
      setError("Unable to connect to the server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/40 text-[#085041] dark:text-teal-400 shadow-2xs mb-0.5">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F1F5F9]">Welcome back</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Sign in to your verified CuraLink account</p>
        </div>
      </div>

      <AuthError message={error} />

      {/* Single, Clean Google Login */}
      <GoogleAuthButton
        label="Continue with Google"
        onError={setError}
        onSuccess={(user, token) => finishLogin(user, token)}
      />

      {/* Refined Divider */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-[#263049]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-[#111726] px-3 font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            or continue with email
          </span>
        </div>
      </div>

      {/* Email Input */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="doctor@hospital.org or patient@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
          className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F1F5F9] transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0B1120] focus:border-[#0F9D8C] dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/20 ${
            fieldErrors.email ? "border-red-300 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 dark:border-[#263049]"
          }`}
        />
        {fieldErrors.email && (
          <span className="text-xs text-red-600 dark:text-red-400 font-medium">{fieldErrors.email}</span>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1">
        <PasswordInput
          label="Password"
          id="login-password"
          autoComplete="current-password"
          placeholder="Enter your secure password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: "" })); }}
          error={fieldErrors.password}
        />
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-[#085041] dark:text-teal-500 focus:ring-[#085041] cursor-pointer"
          />
          <span className="text-xs text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            Remember me
          </span>
        </label>

        <Link
          href="/forgot-password"
          target="_self"
          className="text-xs font-semibold text-[#0F9D8C] dark:text-teal-400 hover:text-[#085041] dark:hover:text-teal-300 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {/* Bot Verification / Security Badge */}
      <TurnstileWidget
        action="login"
        onVerify={handleTurnstileVerify}
        onExpire={handleTurnstileExpire}
        onError={handleTurnstileExpire}
      />

      {/* Primary Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#085041] hover:bg-[#06382e] dark:bg-teal-600 dark:hover:bg-teal-500 text-sm font-semibold text-white shadow-sm shadow-[#085041]/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/40 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-white" />
            <span>Signing you in...</span>
          </>
        ) : (
          <>
            <span>Log In</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {/* Sign Up Link */}
      <div className="pt-2 text-center space-y-2 border-t border-slate-100 dark:border-[#263049]">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            target="_self"
            className="font-semibold text-[#0F9D8C] dark:text-teal-400 hover:text-[#085041] dark:hover:text-teal-300 transition-colors underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>

        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Doctor or Clinician? Sign in above to automatically load your Practice Portal.
        </p>
      </div>
    </form>
  );
}

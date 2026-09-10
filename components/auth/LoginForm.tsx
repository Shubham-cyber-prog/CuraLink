"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { PasswordInput } from "./PasswordInput";
import { AuthError } from "./AuthError";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { TurnstileWidget } from "./TurnstileWidget";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const handleGoogleLogin = async (credential: string) => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Unable to sign in with Google");
        return;
      }

      finishLogin(data.data.user, data.data.token);
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
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

    if (!turnstileToken) {
      setError("Please complete the bot security check to continue.");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch CSRF token first
      const csrfRes = await fetch(`${API_BASE}/auth/csrf-token`);
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.token;

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "X-Turnstile-Token": turnstileToken,
        },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, turnstileToken }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid email or password");
        return;
      }

<<<<<<< Updated upstream
      const { user } = data.data;

      if (onSuccess) {
        onSuccess(user, ""); // We no longer pass token to client
      } else {
        const role = user.role as string;
        if (role === "DOCTOR") router.push("/doctor-dashboard");
        else if (role === "ADMIN") router.push("/admin-dashboard");
        else router.push("/dashboard");
      }
    } catch (err) {
=======
      const { token, user } = data.data;

      finishLogin(user, token);
    } catch {
>>>>>>> Stashed changes
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F1F5F9]">Welcome back</h2>
        <p className="text-sm text-slate-500 dark:text-[#94A3B8] font-normal">Sign in to your CuraLink account</p>
      </div>

      <AuthError message={error} />

      {/* Google Login */}
      <GoogleAuthButton label="Log in with Google" onError={setError} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-[#263049]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-[#151B2E] px-2 text-slate-500 dark:text-[#94A3B8]">Or continue with</span>
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-medium text-slate-700 dark:text-[#F1F5F9]">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: "" })); }}
          className={`w-full rounded-lg border bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F1F5F9] transition-colors duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
            fieldErrors.email ? "border-red-300 dark:border-red-500" : "border-slate-200 dark:border-[#263049]"
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
          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
        <span className="text-sm text-slate-600 dark:text-[#94A3B8] group-hover:text-slate-800 dark:group-hover:text-[#F1F5F9] transition-colors">Remember me</span>
      </label>

      {/* Cloudflare Turnstile Bot Protection */}
      <TurnstileWidget
        action="login"
        onVerify={(token) => {
          setTurnstileToken(token);
          setError(null);
        }}
        onExpire={() => setTurnstileToken(null)}
        onError={() => setTurnstileToken(null)}
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !turnstileToken}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 dark:bg-teal-600 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition-all duration-150 hover:bg-teal-800 dark:hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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

      {GOOGLE_CLIENT_ID && (
        <>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="afterInteractive"
            onLoad={() => {
              if (!window.google) return;
              window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response) => void handleGoogleLogin(response.credential),
              });
              const button = document.getElementById("google-sign-in-button");
              if (button) window.google.accounts.id.renderButton(button, { theme: "outline", size: "large", width: "400" });
            }}
          />
          <div id="google-sign-in-button" className={isGoogleLoading ? "pointer-events-none opacity-60" : "flex justify-center"} />
        </>
      )}

      {/* Sign up link */}
      <p className="text-center text-sm text-slate-500 dark:text-[#94A3B8]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
          Create account
        </Link>
      </p>
    </form>
  );
}

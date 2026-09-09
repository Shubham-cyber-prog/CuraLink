"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError } from "@/components/auth/AuthError";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Invalid email format");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the bot security check to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const csrfRes = await fetch(`${API_BASE}/auth/csrf-token`);
      const csrfData = await csrfRes.json();
      const csrfToken = csrfData.token;

      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "X-Turnstile-Token": turnstileToken,
        },
        credentials: "omit",
        body: JSON.stringify({ email: email.trim().toLowerCase(), turnstileToken }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Reset your password">
      {isSuccess ? (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 border border-teal-100 dark:bg-teal-950/40 dark:border-teal-800/60">
            <CheckCircle size={28} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Check your email</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              If an account exists for <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span>, we&apos;ve sent password reset instructions to your inbox.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Forgot password?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">Enter your email and we&apos;ll send you a link to reset your password.</p>
          </div>

          <AuthError message={error} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="forgot-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                className={`w-full pl-10 pr-3.5 py-2 rounded-lg border bg-white dark:bg-[#1C2338] text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 dark:focus:border-teal-400 ${
                  emailError ? "border-red-300 dark:border-red-800" : "border-slate-200 dark:border-[#263049]"
                }`}
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            </div>
            {emailError && <span className="text-xs text-red-600 dark:text-red-400 font-medium">{emailError}</span>}
          </div>

          {/* Cloudflare Turnstile Bot Protection */}
          <TurnstileWidget
            action="forgot-password"
            onVerify={(token) => {
              setTurnstileToken(token);
              setError(null);
            }}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />

          <button
            type="submit"
            disabled={isLoading || !turnstileToken}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sending link...</span>
              </>
            ) : (
              "Send reset link"
            )}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

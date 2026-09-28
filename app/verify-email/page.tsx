"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthError } from "@/components/auth/AuthError";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  ArrowRight,
  RefreshCw,
  Loader2,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"verifying" | "success" | "expired" | "already_used" | "error" | "pending_request">("verifying");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    setStatus("verifying");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "Your email address has been successfully verified!");
      } else if (data.reason === "EXPIRED") {
        setStatus("expired");
        setMessage(data.message || "This verification link has expired.");
      } else if (data.reason === "ALREADY_USED") {
        setStatus("already_used");
        setMessage(data.message || "This email address is already verified.");
      } else {
        setStatus("error");
        setMessage(data.message || "Invalid or unrecognized verification token.");
      }
    } catch {
      setStatus("error");
      setMessage("Unable to reach the server. Please check your internet connection.");
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setStatus("pending_request");
    }
  }, [token, verifyToken]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendError("Please enter your registered email address.");
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResendSuccess(true);
      } else {
        setResendError(data.message || "Failed to resend verification email. Please try again.");
      }
    } catch {
      setResendError("Network error. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Verifying Loading State */}
      {status === "verifying" && (
        <div className="text-center py-6 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 border border-teal-100 dark:bg-teal-950/40 dark:border-teal-800/60">
            <Loader2 className="h-7 w-7 text-teal-600 dark:text-teal-400 animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Verifying your email...
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Validating your secure clinical verification token.
            </p>
          </div>
        </div>
      )}

      {/* 2. Success State */}
      {status === "success" && (
        <div className="text-center py-4 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/60">
            <CheckCircle className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Email Verified Successfully!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              {message}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white shadow-sm shadow-teal-600/20 transition-all duration-200 hover:bg-teal-700 active:scale-[0.98]"
            >
              Sign In to Your Account <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Already Used State */}
      {status === "already_used" && (
        <div className="text-center py-4 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 border border-teal-100 dark:bg-teal-950/40 dark:border-teal-800/60">
            <CheckCircle className="h-7 w-7 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Already Verified
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              Your email address has already been verified. You can proceed directly to your patient dashboard or login.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-teal-700"
            >
              Go to Login <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* 4. Expired State */}
      {status === "expired" && (
        <div className="text-center py-4 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-100 dark:bg-amber-950/40 dark:border-amber-800/60">
            <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Verification Link Expired
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              Verification links expire after 30 minutes for medical security. Enter your email below to receive a fresh verification link.
            </p>
          </div>

          <form onSubmit={handleResend} className="space-y-4 text-left pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  required
                />
              </div>
            </div>

            {resendError && <AuthError message={resendError} />}
            {resendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                A new verification email has been dispatched. Please check your inbox.
              </div>
            )}

            <button
              type="submit"
              disabled={isResending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-700 disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending Link...
                </>
              ) : (
                <>
                  <RefreshCw size={16} /> Resend Verification Email
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 5. Error or Missing Token State */}
      {(status === "error" || status === "pending_request") && (
        <div className="text-center py-4 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-100 dark:bg-rose-950/40 dark:border-rose-800/60">
            <AlertCircle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {status === "error" ? "Verification Failed" : "Email Verification"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              {status === "error"
                ? message
                : "Need a verification email? Enter your account email below and we will send you a secure link."}
            </p>
          </div>

          <form onSubmit={handleResend} className="space-y-4 text-left pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  required
                />
              </div>
            </div>

            {resendError && <AuthError message={resendError} />}
            {resendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                A verification link has been sent to your email address.
              </div>
            )}

            <button
              type="submit"
              disabled={isResending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white transition-all duration-200 hover:bg-teal-700 disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <RefreshCw size={16} /> Send Verification Link
                </>
              )}
            </button>
          </form>

          <div className="pt-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout subtitle="Account Security & Email Verification">
      <Suspense
        fallback={
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto" />
            <p className="mt-3 text-sm text-slate-500">Loading verification portal...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}

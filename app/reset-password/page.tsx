"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { AuthError } from "@/components/auth/AuthError";
import { CheckCircle, ArrowLeft } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!password) errors.password = "Password is required";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters";
    else if (!/[a-zA-Z]/.test(password)) errors.password = "Must contain at least one letter";
    else if (!/[0-9]/.test(password)) errors.password = "Must contain at least one number";
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset link.");
      return;
    }
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to reset password. The link may have expired.");
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
          <CheckCircle size={28} className="text-teal-600" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">Password reset successful</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your password has been updated. You can now sign in with your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition-all duration-200 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 active:scale-[0.98]"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Set new password</h2>
        <p className="text-sm text-slate-500 font-normal">Create a strong password for your CuraLink account.</p>
      </div>

      <AuthError message={error} />

      <div>
        <PasswordInput
          label="New Password"
          id="reset-password"
          autoComplete="new-password"
          placeholder="Enter your new password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => { const c = {...p}; delete c.password; return c; }); }}
          error={fieldErrors.password}
        />
        <PasswordStrength password={password} />
      </div>

      <PasswordInput
        label="Confirm New Password"
        id="reset-confirm-password"
        autoComplete="new-password"
        placeholder="Repeat your new password"
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => { const c = {...p}; delete c.confirmPassword; return c; }); }}
        error={fieldErrors.confirmPassword}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition-all duration-200 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Resetting password...</span>
          </>
        ) : (
          "Reset password"
        )}
      </button>

      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-teal-600 hover:text-teal-700 transition-colors">
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout subtitle="Reset your password">
      <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full" /></div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}

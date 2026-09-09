"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Stethoscope, Check } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrength } from "./PasswordStrength";
import { AuthError } from "./AuthError";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { TurnstileWidget } from "./TurnstileWidget";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RoleOption = "PATIENT" | "DOCTOR";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RoleOption>("PATIENT");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validate = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Full name is required";
    else if (name.trim().length < 2) errors.name = "Name must be at least 2 characters";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";
    if (!password) errors.password = "Password is required";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters";
    else if (!/[a-zA-Z]/.test(password)) errors.password = "Password must contain at least one letter";
    else if (!/[0-9]/.test(password)) errors.password = "Password must contain at least one number";
    if (!confirmPassword) errors.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!agreedToTerms) errors.terms = "You must agree to the terms";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, email, password, confirmPassword, agreedToTerms]);

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

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
          "X-Turnstile-Token": turnstileToken,
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
          turnstileToken,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roles: { value: RoleOption; label: string; description: string; icon: React.ReactNode }[] = [
    { value: "PATIENT", label: "Patient", description: "Access to consultations & AI triage", icon: <User size={20} /> },
    { value: "DOCTOR", label: "Doctor", description: "Manage patients & appointments", icon: <Stethoscope size={20} /> },
  ];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Header */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#F1F5F9]">Create your account</h2>
        <p className="text-sm text-slate-500 dark:text-[#94A3B8] font-normal">Join CuraLink to get started</p>
      </div>

      <AuthError message={error} />

      {/* Google Signup */}
      <GoogleAuthButton label="Sign up with Google" onError={setError} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-[#263049]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-[#151B2E] px-2 text-slate-500 dark:text-[#94A3B8]">Or continue with email</span>
        </div>
      </div>

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-3">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500/30 cursor-pointer active:scale-[0.97] ${
              role === r.value
                ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-1 ring-teal-500/20"
                : "border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338] hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#263049]"
            }`}
          >
            {role === r.value && (
              <div className="absolute top-2 right-2 h-4.5 w-4.5 rounded-full bg-teal-600 flex items-center justify-center">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}
            <span className={role === r.value ? "text-teal-600 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"}>{r.icon}</span>
            <span className={`text-sm font-semibold ${role === r.value ? "text-teal-700 dark:text-teal-300" : "text-slate-700 dark:text-[#F1F5F9]"}`}>
              {r.label}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-[#94A3B8] text-center leading-tight">{r.description}</span>
          </button>
        ))}
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-name" className="text-sm font-medium text-slate-700 dark:text-[#F1F5F9]">Full Name</label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Dr. Jane Doe"
          value={name}
          onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
          className={`w-full rounded-lg border bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F1F5F9] transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
            fieldErrors.name ? "border-red-300 dark:border-red-500" : "border-slate-200 dark:border-[#263049]"
          }`}
        />
        {fieldErrors.name && <span className="text-xs text-red-600 font-medium">{fieldErrors.name}</span>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-email" className="text-sm font-medium text-slate-700 dark:text-[#F1F5F9]">Email Address</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
          className={`w-full rounded-lg border bg-white dark:bg-[#0B1120] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F1F5F9] transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
            fieldErrors.email ? "border-red-300 dark:border-red-500" : "border-slate-200 dark:border-[#263049]"
          }`}
        />
        {fieldErrors.email && <span className="text-xs text-red-600 font-medium">{fieldErrors.email}</span>}
      </div>

      {/* Password */}
      <div>
        <PasswordInput
          label="Password"
          id="signup-password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
          error={fieldErrors.password}
        />
        <PasswordStrength password={password} />
      </div>

      {/* Confirm Password */}
      <PasswordInput
        label="Confirm Password"
        id="signup-confirm-password"
        autoComplete="new-password"
        placeholder="Repeat your password"
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
        error={fieldErrors.confirmPassword}
      />

      {/* Terms */}
      <label className="flex items-start gap-2.5 cursor-pointer group select-none">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => { setAgreedToTerms(e.target.checked); clearFieldError("terms"); }}
          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500 cursor-pointer mt-0.5"
        />
        <span className={`text-xs leading-relaxed ${fieldErrors.terms ? "text-red-600" : "text-slate-500 dark:text-[#94A3B8]"}`}>
          I agree to CuraLink&apos;s{" "}
          <Link href="/terms-of-service" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">Terms of Service</Link> and{" "}
          <Link href="/privacy-policy" className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">Privacy Policy</Link>
        </span>
      </label>
      {fieldErrors.terms && <span className="text-xs text-red-600 font-medium -mt-3 block">{fieldErrors.terms}</span>}

      {/* Cloudflare Turnstile Bot Protection */}
      <TurnstileWidget
        action="signup"
        onVerify={(token) => {
          setTurnstileToken(token);
          clearFieldError("turnstile");
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
            <span>Creating your account...</span>
          </>
        ) : (
          "Create account"
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-slate-500 dark:text-[#94A3B8]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
          Log in
        </Link>
      </p>
    </form>
  );
}

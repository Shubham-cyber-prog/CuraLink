"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Stethoscope, Check } from "lucide-react";
import { PasswordInput } from "./PasswordInput";
import { PasswordStrength } from "./PasswordStrength";
import { AuthError } from "./AuthError";

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

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
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
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Create your account</h2>
        <p className="text-sm text-slate-500 font-normal">Join CuraLink to get started</p>
      </div>

      <AuthError message={error} />

      {/* Role Selector */}
      <div className="grid grid-cols-2 gap-3">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-3.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 ${
              role === r.value
                ? "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {role === r.value && (
              <div className="absolute top-2 right-2 h-4.5 w-4.5 rounded-full bg-teal-600 flex items-center justify-center">
                <Check size={12} className="text-white" strokeWidth={3} />
              </div>
            )}
            <span className={role === r.value ? "text-teal-600" : "text-slate-400"}>{r.icon}</span>
            <span className={`text-sm font-semibold ${role === r.value ? "text-teal-700" : "text-slate-700"}`}>
              {r.label}
            </span>
            <span className="text-[11px] text-slate-400 text-center leading-tight">{r.description}</span>
          </button>
        ))}
      </div>

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-name" className="text-sm font-medium text-slate-700">Full Name</label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Dr. Jane Doe"
          value={name}
          onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
            fieldErrors.name ? "border-red-300" : "border-slate-200"
          }`}
        />
        {fieldErrors.name && <span className="text-xs text-red-600 font-medium">{fieldErrors.name}</span>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signup-email" className="text-sm font-medium text-slate-700">Email Address</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
          className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
            fieldErrors.email ? "border-red-300" : "border-slate-200"
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
          className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer mt-0.5"
        />
        <span className={`text-xs leading-relaxed ${fieldErrors.terms ? "text-red-600" : "text-slate-500"}`}>
          I agree to CuraLink&apos;s{" "}
          <Link href="#" className="font-semibold text-teal-600 hover:underline">Terms of Service</Link> and{" "}
          <Link href="#" className="font-semibold text-teal-600 hover:underline">Privacy Policy</Link>
        </span>
      </label>
      {fieldErrors.terms && <span className="text-xs text-red-600 font-medium -mt-3 block">{fieldErrors.terms}</span>}

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
            <span>Creating your account...</span>
          </>
        ) : (
          "Create account"
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
          Log in
        </Link>
      </p>
    </form>
  );
}

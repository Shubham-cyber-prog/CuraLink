"use client";

import React from "react";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  if (!password) return null;

  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-zA-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
      case 2:
        return { label: "Fair", color: "bg-amber-500", width: "w-2/4" };
      case 3:
        return { label: "Good", color: "bg-teal-500", width: "w-3/4" };
      case 4:
        return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
      default:
        return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    }
  };

  const strength = getStrength();

  return (
    <div className="mt-2 w-full space-y-1.5 animate-fadeIn">
      <div className="flex justify-between items-center text-xs font-medium">
        <span className="text-slate-500">Password Strength:</span>
        <span className={
          strength.label === "Weak" ? "text-red-600" :
          strength.label === "Fair" ? "text-amber-600" :
          strength.label === "Good" ? "text-teal-600" : "text-emerald-600"
        }>
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
      </div>
    </div>
  );
}

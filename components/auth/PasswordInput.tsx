"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function PasswordInput({ label, error, className = "", id, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center">
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      </div>
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type={showPassword ? "text" : "password"}
          className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0B1120] px-3.5 py-2.5 pr-11 text-sm text-slate-900 dark:text-[#F1F5F9] transition-all duration-150 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#0B1120] focus:outline-none focus:ring-2 focus:ring-[#0F9D8C]/20 focus:border-[#0F9D8C] dark:focus:border-teal-400 ${
            error ? "border-red-300 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 dark:border-[#263049]"
          } ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">{error}</span>
      )}
    </div>
  );
}

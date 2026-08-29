"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface AuthErrorProps {
  message?: string | null;
}

export function AuthError({ message }: AuthErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200/60 p-3.5 text-red-800 text-sm font-medium animate-fadeIn">
      <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

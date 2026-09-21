"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface GoogleAuthButtonProps {
  label?: string;
  role?: "PATIENT" | "DOCTOR" | string;
  onError?: (error: string) => void;
  onSuccess?: (user: Record<string, unknown>, token: string) => void;
}

export function GoogleAuthButton({ label = "Continue with Google", role, onError, onSuccess }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        // Send the access token to our backend for verification and JWT creation
        // Fetch CSRF token first (safely fallback if CSRF endpoint fails or route is exempt)
        let csrfToken = "";
        try {
          const csrfRes = await fetch(`${API_BASE}/auth/csrf-token`);
          if (csrfRes.ok) {
            const csrfData = await csrfRes.json();
            csrfToken = csrfData.token || "";
          }
        } catch (csrfErr) {
          console.warn("Could not retrieve CSRF token, proceeding without it:", csrfErr);
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (csrfToken) {
          headers["X-CSRF-Token"] = csrfToken;
        }

        // Determine role from prop, or fallback to sessionStorage
        let selectedRole = role;
        if (!selectedRole && typeof window !== "undefined") {
          selectedRole = sessionStorage.getItem("curalink_signup_role") || "PATIENT";
        }
        if (!selectedRole) {
          selectedRole = "PATIENT";
        }

        const res = await fetch(`${API_BASE}/auth/google`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            token: tokenResponse.access_token,
            role: selectedRole,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) {
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("curalink_signup_role");
          }
          const user = data.data?.user;
          const token = data.data?.token || "";
          if (onSuccess) {
            onSuccess(user, token);
          } else {
            const userRole = user?.role as string;
            if (userRole === "DOCTOR") router.push("/doctor-dashboard");
            else if (userRole === "ADMIN") router.push("/admin-dashboard");
            else router.push("/dashboard");
          }
        } else {
          const errMsg = data?.message || "Google authentication failed";
          console.error("Authentication failed:", res.status, errMsg);
          if (onError) onError(errMsg);
        }
      } catch (error: unknown) {
        console.error("Error during Google Auth", error);
        const err = error as { name?: string; message?: string } | null;
        const isNetworkError =
          err?.name === "TypeError" ||
          Boolean(err?.message?.includes("fetch")) ||
          Boolean(err?.message?.includes("Failed to fetch"));
        if (onError) {
          onError(
            isNetworkError
              ? "Unable to connect to the backend server (http://localhost:5000). Please ensure the backend server is running."
              : "Unable to complete Google authentication. Please try again."
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Failed", error);
      if (onError) onError("Google sign-in popup was closed or failed to complete.");
    }
  });

  return (
    <Button
      variant="outline"
      type="button"
      className="w-full h-11 relative rounded-xl border border-slate-200 dark:border-[#263049] bg-white dark:bg-[#0B1120] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#151B2E] font-medium text-sm transition-all duration-150 shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
      onClick={() => login()}
      disabled={isLoading}
    >
      <div className="flex items-center justify-center gap-2.5">
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        )}
        <span>{isLoading ? "Connecting to Google..." : label}</span>
      </div>
    </Button>
  );
}

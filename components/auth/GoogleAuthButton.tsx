"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface GoogleAuthButtonProps {
  label?: string;
  onError?: (error: string) => void;
}

export function GoogleAuthButton({ label = "Continue with Google", onError }: GoogleAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        // Send the access token to our backend for verification and JWT creation
        // Fetch CSRF token first
        const csrfRes = await fetch(`${API_BASE}/auth/csrf-token`);
        const csrfData = await csrfRes.json();
        const csrfToken = csrfData.token;

        const res = await fetch(`${API_BASE}/auth/google`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken 
          },
          credentials: "include",
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          // Cookies are automatically set by the backend
          router.push("/dashboard");
        } else {
          const errMsg = data.message || "Google authentication failed";
          console.error("Authentication failed:", res.status, errMsg);
          if (onError) onError(errMsg);
        }
      } catch (error) {
        console.error("Error during Google Auth", error);
        if (onError) onError("Unable to complete Google authentication. Please try again.");
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
      className="w-full relative bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
      onClick={() => login()}
      disabled={isLoading}
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
      </div>
      {isLoading ? "Authenticating..." : label}
    </Button>
  );
}

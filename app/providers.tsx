"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: React.ReactNode }) {
  // Using the NEXT_PUBLIC environment variable, with a fallback if the dev server hasn't been restarted
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "498397902593-9h36l23od7sngoejesi3h84m7enrhm0c.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

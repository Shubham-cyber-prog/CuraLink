import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In — CuraLink",
  description: "Sign in to your CuraLink telehealth account to access your dashboard, appointments, and secure messaging.",
};

export default function LoginPage() {
  return (
    <AuthLayout subtitle="Sign in to your account">
      <LoginForm />
    </AuthLayout>
  );
}

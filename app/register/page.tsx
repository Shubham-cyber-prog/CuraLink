import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account — CuraLink",
  description: "Create your CuraLink account to connect with licensed healthcare professionals, manage appointments, and access AI-powered health guidance.",
};

export default function RegisterPage() {
  return (
    <AuthLayout subtitle="Create your account">
      <SignupForm />
    </AuthLayout>
  );
}

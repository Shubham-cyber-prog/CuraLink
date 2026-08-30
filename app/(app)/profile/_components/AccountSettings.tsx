"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormSection } from "./FormSection";
import { passwordSchema, PasswordFormValues } from "../schemas";
import { UserProfile } from "@/lib/mock-data";

export function AccountSettings({ user }: { user: UserProfile }) {
  const [emailNotifs, setEmailNotifs] = useState(user.emailNotifications ?? true);
  const [apptNotifs, setApptNotifs] = useState(user.appointmentReminders ?? true);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmitPassword = (data: PasswordFormValues) => {
    // TODO: replace with real API call to PATCH /api/user/password
    console.log("Saving password:", data);
    resetPwd();
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <FormSection title="Account Settings">
      <div className="mb-6 border-b border-slate-100 pb-6">
        <h3 className="mb-4 text-sm font-medium text-slate-900">Change Password</h3>
        <form onSubmit={handlePwdSubmit(onSubmitPassword)} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Current Password</label>
            <input
              {...registerPwd("currentPassword")}
              type="password"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {pwdErrors.currentPassword && <span className="text-xs text-red-500">{pwdErrors.currentPassword.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5 sm:col-start-1">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <input
              {...registerPwd("newPassword")}
              type="password"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {pwdErrors.newPassword && <span className="text-xs text-red-500">{pwdErrors.newPassword.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              {...registerPwd("confirmPassword")}
              type="password"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {pwdErrors.confirmPassword && <span className="text-xs text-red-500">{pwdErrors.confirmPassword.message}</span>}
          </div>
          <div className="flex items-center gap-4 sm:col-span-2">
            <Button type="submit" variant="outline">Update Password</Button>
            {passwordSuccess && <span className="text-sm font-medium text-teal-600">Password updated!</span>}
          </div>
        </form>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium text-slate-900">Notification Preferences</h3>
        <div className="flex flex-col gap-4">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive health tips and general updates.</p>
            </div>
            <input 
              type="checkbox" 
              checked={emailNotifs} 
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Appointment Reminders</p>
              <p className="text-xs text-slate-500">Get notified 24 hours before your visit.</p>
            </div>
            <input 
              type="checkbox" 
              checked={apptNotifs} 
              onChange={(e) => setApptNotifs(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
          </label>
        </div>
      </div>
    </FormSection>
  );
}

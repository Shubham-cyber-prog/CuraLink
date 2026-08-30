"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Camera } from "lucide-react";
import {
  getMotionVariants,
  staggerContainer,
  cardReveal,
  fadeInUp,
} from "@/components/motion/variants";
import { MOCK_USER, UserProfile } from "@/lib/mock-data";
import { ProfileForm } from "./_components/ProfileForm";
import { AccountSettings } from "./_components/AccountSettings";
import { DangerZone } from "./_components/DangerZone";

export default function ProfilePage() {
  const reduceMotion = Boolean(useReducedMotion());
  const variants = getMotionVariants(reduceMotion);
  
  // TODO: replace with real API call to GET /api/user/profile
  const [user] = useState<UserProfile>(MOCK_USER);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants.container}
      className="mx-auto max-w-3xl pb-10"
    >
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl">
          My Profile
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Manage your account and health records.
        </p>
      </motion.div>

      <motion.div variants={staggerContainer} className="flex flex-col gap-6">
        
        {/* Header Card */}
        <motion.section
          variants={cardReveal}
          className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-900/5 sm:flex-row"
        >
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700">
            <span className="text-3xl font-semibold">{user.name.charAt(0)}</span>
            <button 
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white transition-colors hover:bg-slate-700"
              aria-label="Edit photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-slate-900">{user.name}</h2>
            <p className="text-slate-500">{user.email}</p>
            <div className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Member since 2024
            </div>
          </div>
        </motion.section>

        {/* Profile Form (Personal & Health Info) */}
        <ProfileForm user={user} />

        {/* Account Settings (Password & Notifications) */}
        <AccountSettings user={user} />

        {/* Danger Zone (Logout & Delete) */}
        <DangerZone />

      </motion.div>
    </motion.div>
  );
}

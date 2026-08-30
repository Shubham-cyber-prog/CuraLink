"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cardReveal } from "@/components/motion/variants";
import { useRouter } from "next/navigation";

export function DangerZone() {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Reuse existing logout logic or dispatch
    console.log("Logging out...");
    // Simulate logout
    router.push("/login");
  };

  const handleDeleteAccount = () => {
    // TODO: replace with real API call to DELETE /api/user/profile
    console.log("Deleting account...");
    setShowConfirmDelete(false);
  };

  return (
    <motion.section
      variants={cardReveal}
      className="rounded-2xl border border-red-100 bg-red-50/50 p-6"
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
        <p className="mt-1 text-sm text-red-600/80">
          Irreversible actions related to your account.
        </p>
      </div>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button variant="outline" className="text-slate-700" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
        <Button 
          variant="destructive" 
          className="bg-red-600 hover:bg-red-700"
          onClick={() => setShowConfirmDelete(true)}
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Delete account
        </Button>
      </div>

      {showConfirmDelete && (
        <div className="mt-4 rounded-xl border border-red-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900">Are you absolutely sure?</h3>
          <p className="mt-1 text-sm text-slate-500">
            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Yes, delete account</Button>
          </div>
        </div>
      )}
    </motion.section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, Bell, Key, Monitor, Smartphone, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

type TabType = "general" | "security" | "notifications";

export default function EnterpriseProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("general");
  
  // Form States
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("curalink_token") || sessionStorage.getItem("curalink_token");
        if (!token) {
          router.replace("/login?redirect=/profile");
          return;
        }

        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setProfile(data.data);
          setFormData({ name: data.data.name, email: data.data.email });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      const token = localStorage.getItem("curalink_token") || sessionStorage.getItem("curalink_token");
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }
      
      setProfile(data.data);
      setHasChanges(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-56 shrink-0">
          <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-x-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "general"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <User className="h-4 w-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "security"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Shield className="h-4 w-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "notifications"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Profile Card */}
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="text-base font-semibold text-slate-900">Profile</h2>
                  <p className="text-sm text-slate-500 mt-1">This information will be displayed publicly.</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xl font-medium border border-slate-200">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="h-8 rounded-md px-3 text-xs font-medium border-slate-200">
                          Upload new
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 rounded-md px-3 text-xs font-medium text-slate-500 hover:text-red-600">
                          Remove
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 min-w-0">
                      <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
                      <input 
                        id="name" 
                        type="text" 
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({...formData, name: e.target.value});
                          setHasChanges(true);
                          setSaveSuccess(false);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" 
                      />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                      <input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({...formData, email: e.target.value});
                          setHasChanges(true);
                          setSaveSuccess(false);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    {saveError ? (
                      <p className="text-sm text-red-600 font-medium truncate">{saveError}</p>
                    ) : saveSuccess ? (
                      <p className="text-sm text-emerald-600 font-medium flex items-center gap-1.5"><Check className="h-4 w-4"/> Saved successfully</p>
                    ) : (
                      <p className="text-sm text-slate-500 truncate">Please use a valid email address.</p>
                    )}
                  </div>
                  <Button 
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 px-4 text-sm font-medium disabled:opacity-50 shrink-0"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </div>
              </section>

              {/* Danger Zone */}
              <section className="rounded-xl border border-red-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-red-100 px-6 py-5">
                  <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
                  <p className="text-sm text-slate-500 mt-1">Irreversible and destructive actions.</p>
                </div>
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Delete Account</h3>
                    <p className="text-sm text-slate-500 mt-1">Permanently remove your account and all of its contents.</p>
                  </div>
                  <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-9 px-4 text-sm font-medium shrink-0">
                    Delete account
                  </Button>
                </div>
              </section>

            </div>
          )}


          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="text-base font-semibold text-slate-900">Change Password</h2>
                  <p className="text-sm text-slate-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
                </div>
                <div className="p-6 space-y-4 max-w-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
                  </div>
                  <div className="pt-2">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 px-4 text-sm font-medium">
                      Update Password
                    </Button>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Two-Factor Authentication</h2>
                    <p className="text-sm text-slate-500 mt-1">Add additional security to your account using 2FA.</p>
                  </div>
                  <div className="relative inline-block w-11 h-6 select-none transition-all">
                    <div className="block bg-slate-200 w-11 h-6 rounded-full"></div>
                    <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="text-base font-semibold text-slate-900">Active Sessions</h2>
                  <p className="text-sm text-slate-500 mt-1">Manage and log out your active sessions on other browsers and devices.</p>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="p-6 flex items-start gap-4">
                    <Monitor className="h-6 w-6 text-teal-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">Windows 11 • Edge</p>
                        <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                          This Device
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">192.168.1.1 • Active now</p>
                    </div>
                  </div>
                  <div className="p-6 flex items-start gap-4">
                    <Smartphone className="h-6 w-6 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">iPhone 14 Pro • Safari</p>
                      <p className="text-sm text-slate-500 mt-1">10.0.0.42 • Last active 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 rounded-md text-xs font-medium">
                      Revoke
                    </Button>
                  </div>
                </div>
              </section>

            </div>
          )}


          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-5">
                  <h2 className="text-base font-semibold text-slate-900">Email Notifications</h2>
                  <p className="text-sm text-slate-500 mt-1">Choose what updates you want to receive directly to your inbox.</p>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Appointment Reminders</h3>
                      <p className="text-sm text-slate-500 mt-1">Receive emails 24 hours before your scheduled appointment.</p>
                    </div>
                    {/* Active Toggle Switch */}
                    <div className="relative inline-block w-11 h-6 select-none cursor-pointer">
                      <div className="block bg-teal-500 w-11 h-6 rounded-full transition-colors"></div>
                      <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Marketing & Updates</h3>
                      <p className="text-sm text-slate-500 mt-1">Receive product updates, newsletters, and promotional content.</p>
                    </div>
                    {/* Inactive Toggle Switch */}
                    <div className="relative inline-block w-11 h-6 select-none cursor-pointer">
                      <div className="block bg-slate-200 w-11 h-6 rounded-full transition-colors"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}

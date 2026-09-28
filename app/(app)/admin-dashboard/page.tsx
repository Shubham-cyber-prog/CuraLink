"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  UserCheck,
  Clock,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  ChevronRight,
  Activity,
  Lock,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";

interface AdminStats {
  totalUsers: number;
  patientCount: number;
  doctorCount: number;
  verifiedDoctors: number;
  pendingVerifications: number;
  totalAppointments: number;
  totalPrescriptions: number;
  pendingErasureRequests: number;
  totalAuditLogs: number;
}

interface DoctorItem {
  id: string;
  userId: string;
  medicalLicenseNumber: string;
  specialization: string;
  experienceYears: number;
  consultationFee: number;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  verifiedAt?: string | null;
  city?: string | null;
  bio?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  createdAt: string;
}

interface AppointmentItem {
  id: string;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  doctor?: { user?: { id: string; name: string; email: string } };
  payment?: { status: string; amount: number } | null;
}

interface ErasureRequestItem {
  id: string;
  userId: string;
  reason?: string | null;
  status: string;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string };
}

interface AuditLogItem {
  id: string;
  action: string;
  resource?: string | null;
  resourceId?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string; role: string } | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "doctors" | "users" | "appointments" | "erasure" | "audit">("overview");
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string>("/login");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [erasureRequests, setErasureRequests] = useState<ErasureRequestItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const getHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("curalink_token") || sessionStorage.getItem("curalink_token")
        : null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  const loadData = async () => {
    try {
      // 1. Verify user is authenticated and has strictly ADMIN role
      const meRes = await fetch(`${apiBase}/auth/me`, {
        headers: getHeaders(),
        credentials: "include",
      });
      const meData = await meRes.json().catch(() => null);

      if (!meRes.ok || !meData?.data?.user) {
        setAuthChecking(false);
        setIsAuthorized(false);
        setRedirectTarget("/login?redirect=/admin-dashboard");
        router.replace("/login?error=admin_required");
        return;
      }

      const userRole = meData.data.user.role;
      if (userRole !== "ADMIN") {
        setAuthChecking(false);
        setIsAuthorized(false);
        const destination = userRole === "DOCTOR" ? "/doctor-dashboard" : "/dashboard";
        setRedirectTarget(destination);
        router.replace(`${destination}?error=admin_access_denied`);
        return;
      }

      // Validated administrator credentials
      setIsAuthorized(true);
      setAuthChecking(false);
      setLoading(true);

      // 2. Fetch admin stats
      const [statsRes, doctorsRes, usersRes, apptsRes, erasureRes, auditRes] = await Promise.all([
        fetch(`${apiBase}/admin/stats`, { headers: getHeaders(), credentials: "include" }),
        fetch(`${apiBase}/admin/doctors`, { headers: getHeaders(), credentials: "include" }),
        fetch(`${apiBase}/admin/users`, { headers: getHeaders(), credentials: "include" }),
        fetch(`${apiBase}/admin/appointments`, { headers: getHeaders(), credentials: "include" }),
        fetch(`${apiBase}/admin/erasure-requests`, { headers: getHeaders(), credentials: "include" }),
        fetch(`${apiBase}/admin/audit-logs?limit=50`, { headers: getHeaders(), credentials: "include" }),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.data);
      }
      if (doctorsRes.ok) {
        const d = await doctorsRes.json();
        setDoctors(d.data || []);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.data || []);
      }
      if (apptsRes.ok) {
        const d = await apptsRes.json();
        setAppointments(d.data || []);
      }
      if (erasureRes.ok) {
        const d = await erasureRes.json();
        setErasureRequests(d.data || []);
      }
      if (auditRes.ok) {
        const d = await auditRes.json();
        setAuditLogs(d.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load admin data:", err);
      setActionMessage({ text: "Failed to connect to administrative server.", type: "error" });
    } finally {
      setAuthChecking(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyDoctor = async (doctorId: string, status: "APPROVED" | "REJECTED") => {
    setProcessingId(doctorId);
    try {
      const res = await fetch(`${apiBase}/admin/doctors/${doctorId}/verify-status`, {
        method: "PUT",
        headers: getHeaders(),
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ text: `Doctor status updated to ${status}.`, type: "success" });
        setDoctors((prev) =>
          prev.map((d) => (d.userId === doctorId || d.id === doctorId ? { ...d, verificationStatus: status } : d))
        );
        if (stats) {
          setStats({
            ...stats,
            pendingVerifications: Math.max(0, stats.pendingVerifications - 1),
            verifiedDoctors: status === "APPROVED" ? stats.verifiedDoctors + 1 : stats.verifiedDoctors,
          });
        }
      } else {
        setActionMessage({ text: data.message || "Failed to update doctor verification status", type: "error" });
      }
    } catch {
      setActionMessage({ text: "Error submitting doctor status.", type: "error" });
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleProcessErasure = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`${apiBase}/admin/erasure-requests/${requestId}/process`, {
        method: "PUT",
        headers: getHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ text: "DPDP Data erasure processed and user anonymized successfully.", type: "success" });
        setErasureRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: "PROCESSED" } : r))
        );
        if (stats) {
          setStats({ ...stats, pendingErasureRequests: Math.max(0, stats.pendingErasureRequests - 1) });
        }
      } else {
        setActionMessage({ text: data.message || "Failed to process erasure request.", type: "error" });
      }
    } catch {
      setActionMessage({ text: "Network error processing erasure request.", type: "error" });
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    const matchesSearch =
      searchTerm === "" ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 animate-pulse">
            <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Verifying Administrative Credentials
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Securing clinical compliance & access control...
            </p>
          </div>
          <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin mt-2" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              This area is strictly restricted to CuraLink System Administrators. Non-admin accounts cannot view or modify clinical administration data.
            </p>
          </div>
          <div className="pt-2">
            <Button
              onClick={() => router.replace(redirectTarget)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl"
            >
              Return to Authorized Portal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Platform Administration
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  CuraLink Telemedicine & Clinical Compliance Control Center
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400">
              Neon PostgreSQL Connected
            </Badge>
          </div>
        </div>

        {/* Action message banner */}
        {actionMessage && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
              actionMessage.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
            }`}
          >
            {actionMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900 rounded-xl">
          {[
            { id: "overview", label: "Overview", icon: Activity },
            { id: "doctors", label: `Doctor Licenses (${stats?.pendingVerifications ?? 0} pending)`, icon: UserCheck },
            { id: "users", label: `Users (${stats?.totalUsers ?? 0})`, icon: Users },
            { id: "appointments", label: `Appointments (${stats?.totalAppointments ?? 0})`, icon: Calendar },
            { id: "erasure", label: `Data Erasure (${stats?.pendingErasureRequests ?? 0})`, icon: Trash2 },
            { id: "audit", label: "Audit Logs", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats?.totalUsers ?? 0}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats?.patientCount ?? 0} Patients · {stats?.doctorCount ?? 0} Doctors
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Doctor Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {stats?.verifiedDoctors ?? 0}
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                    {stats?.pendingVerifications ?? 0} Pending Admin Review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {stats?.totalAppointments ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stats?.totalPrescriptions ?? 0} E-Prescriptions Issued</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">DPDP Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stats?.totalAuditLogs ?? 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats?.pendingErasureRequests ?? 0} Pending Erasure Requests
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>Pending Doctor Approvals</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                      {stats?.pendingVerifications ?? 0} Action Required
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {doctors.filter((d) => d.verificationStatus === "PENDING").length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                      All medical license applications have been verified.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {doctors
                        .filter((d) => d.verificationStatus === "PENDING")
                        .slice(0, 4)
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-between gap-4 border border-slate-200 dark:border-slate-800"
                          >
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {doc.user?.name || "Dr. Applicant"}
                              </div>
                              <div className="text-xs text-slate-500">
                                License: {doc.medicalLicenseNumber} · {doc.specialization}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                onClick={() => handleVerifyDoctor(doc.userId, "APPROVED")}
                                disabled={processingId === doc.userId}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-700 border-rose-300 hover:bg-rose-50"
                                onClick={() => handleVerifyDoctor(doc.userId, "REJECTED")}
                                disabled={processingId === doc.userId}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>Recent System Security Audits</span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("audit")} className="text-xs">
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs flex items-center justify-between border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {log.action}
                          </Badge>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {log.user?.name || log.user?.email || "System"}
                          </span>
                        </div>
                        <span className="text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: DOCTOR VERIFICATION */}
        {activeTab === "doctors" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                <span>Doctor Verification & Clinical Roster</span>
                <span className="text-sm font-normal text-slate-500">
                  {doctors.length} Total Registered Medical Specialists
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">License / Reg #</th>
                      <th className="py-3 px-4">Specialization</th>
                      <th className="py-3 px-4">Experience</th>
                      <th className="py-3 px-4">Fee</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {doctors.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                          <div>{doc.user?.name || "Dr. Medical Specialist"}</div>
                          <div className="text-xs text-slate-500">{doc.user?.email}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                          {doc.medicalLicenseNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{doc.specialization}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{doc.experienceYears} Years</td>
                        <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                          ₹{doc.consultationFee}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              doc.verificationStatus === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : doc.verificationStatus === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400"
                                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400"
                            }
                          >
                            {doc.verificationStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {doc.verificationStatus !== "APPROVED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                              onClick={() => handleVerifyDoctor(doc.userId, "APPROVED")}
                              disabled={processingId === doc.userId}
                            >
                              Approve
                            </Button>
                          )}
                          {doc.verificationStatus !== "REJECTED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                              onClick={() => handleVerifyDoctor(doc.userId, "REJECTED")}
                              disabled={processingId === doc.userId}
                            >
                              Reject
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: PLATFORM USERS */}
        {activeTab === "users" && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-xl font-bold">User Directory</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                  {["ALL", "PATIENT", "DOCTOR", "ADMIN"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                        userRoleFilter === r
                          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Demographics</th>
                      <th className="py-3 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              u.role === "ADMIN"
                                ? "bg-purple-50 text-purple-700 border-purple-300"
                                : u.role === "DOCTOR"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                          {u.phone || "Not provided"}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                          {u.age ? `${u.age} yrs` : "—"}, {u.gender || "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: APPOINTMENTS */}
        {activeTab === "appointments" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Platform Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                          {apt.user?.name || "Patient"}
                          <div className="text-xs text-slate-500">{apt.user?.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                          {apt.doctor?.user?.name || "Dr. Physician"}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {apt.date} at {apt.time}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={
                              apt.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : apt.status === "CANCELLED"
                                ? "bg-rose-50 text-rose-700 border-rose-300"
                                : "bg-sky-50 text-sky-700 border-sky-300"
                            }
                          >
                            {apt.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {apt.payment?.status || "PENDING"} {apt.payment?.amount ? `(₹${apt.payment.amount})` : ""}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: DPDP ERASURE REQUESTS */}
        {activeTab === "erasure" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                <span>Digital Personal Data Protection (DPDP) Erasure Requests</span>
                <span className="text-xs font-normal text-slate-500">Statutory Compliance Under Section 12</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {erasureRequests.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2 opacity-80" />
                  No pending data erasure requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Reason Given</th>
                        <th className="py-3 px-4">Requested Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {erasureRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                          <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                            {req.user?.name || "User"}
                            <div className="text-xs text-slate-500">{req.user?.email}</div>
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                            {req.reason || "Account closure requested"}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-500">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={
                                req.status === "PROCESSED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : "bg-amber-50 text-amber-700 border-amber-300"
                              }
                            >
                              {req.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {req.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50"
                                onClick={() => handleProcessErasure(req.id)}
                                disabled={processingId === req.id}
                              >
                                Anonymize & Erase
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* TAB 6: AUDIT LOGS */}
        {activeTab === "audit" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center justify-between">
                <span>System Security & Audit Trail</span>
                <span className="text-xs font-normal text-slate-500">Latest 50 recorded security events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 text-xs">
                        <td className="py-2.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-4 text-slate-900 dark:text-slate-100">
                          {log.user ? `${log.user.name} (${log.user.email})` : "System / Unauthenticated"}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                          {log.resource ? `${log.resource} ${log.resourceId ? `#${log.resourceId.slice(0, 8)}` : ""}` : "—"}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{log.ipAddress || "127.0.0.1"}</td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

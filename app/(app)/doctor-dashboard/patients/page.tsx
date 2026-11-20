"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  HeartPulse,
  Activity,
  Calendar,
  FileText,
  UserCheck,
  Phone,
  Mail,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface PatientItem {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  email?: string;
  phone?: string;
  lastVisit?: string;
  primaryCondition?: string;
  riskLevel?: "Low" | "Moderate" | "High";
  totalVisits?: number;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "High" | "Moderate" | "Low">("ALL");

  const fetchPatients = useCallback(async () => {
    try {
      const res = await api.get<PatientItem[]>("/doctor/me/patients?limit=100");
      if (res?.success && Array.isArray(res.data)) {
        setPatients(res.data);
      }
    } catch {
      // Sample clinical patients fallback
      setPatients([
        {
          id: "PAT-001",
          name: "Aarav Sharma",
          age: 42,
          gender: "Male",
          email: "aarav.sharma@example.com",
          phone: "+91 98765 43210",
          lastVisit: "Today · 10:30 AM",
          primaryCondition: "Essential Hypertension (Stage 1)",
          riskLevel: "Moderate",
          totalVisits: 6,
        },
        {
          id: "PAT-002",
          name: "Pooja Verma",
          age: 31,
          gender: "Female",
          email: "pooja.v@example.com",
          phone: "+91 98123 45678",
          lastVisit: "Today · 11:45 AM",
          primaryCondition: "Allergic Bronchitis",
          riskLevel: "Low",
          totalVisits: 3,
        },
        {
          id: "PAT-003",
          name: "Devansh Reddy",
          age: 58,
          gender: "Male",
          email: "devansh.r@example.com",
          phone: "+91 97654 32109",
          lastVisit: "Yesterday · 04:45 PM",
          primaryCondition: "Type 2 Diabetes Mellitus + CAD",
          riskLevel: "High",
          totalVisits: 14,
        },
        {
          id: "PAT-004",
          name: "Meenakshi Iyer",
          age: 27,
          gender: "Female",
          email: "meenakshi.i@example.com",
          phone: "+91 98901 23456",
          lastVisit: "Yesterday · 02:30 PM",
          primaryCondition: "Hypothyroidism & Migraine",
          riskLevel: "Low",
          totalVisits: 4,
        },
        {
          id: "PAT-005",
          name: "Karan Malhotra",
          age: 64,
          gender: "Male",
          email: "karan.m@example.com",
          phone: "+91 99112 33445",
          lastVisit: "24 Oct · 12:00 PM",
          primaryCondition: "Dyslipidemia & Chronic Renal Watch",
          riskLevel: "High",
          totalVisits: 18,
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPatients();
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (riskFilter !== "ALL" && p.riskLevel !== riskFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesCondition = p.primaryCondition?.toLowerCase().includes(q);
        const matchesPhone = p.phone?.toLowerCase().includes(q);
        const matchesEmail = p.email?.toLowerCase().includes(q);
        return matchesName || matchesCondition || matchesPhone || matchesEmail;
      }
      return true;
    });
  }, [patients, riskFilter, searchQuery]);

  const highRiskCount = patients.filter((p) => p.riskLevel === "High").length;
  const modRiskCount = patients.filter((p) => p.riskLevel === "Moderate").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071320] text-[#0B1F33] dark:text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/doctor-dashboard" className="hover:text-[#006D77] transition-colors">
            Doctor Cockpit
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-[#006D77] dark:text-[#83C5BE]">
            Patient Cohort &amp; EHR Registry
          </span>
        </div>

        {/* ── 1. HEADER & SEARCH ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white">
                Clinical Patient Directory
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                {patients.length} Active Patients
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Search electronic health records, monitor chronic disease risk stratification, and view clinical histories.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient name, condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006D77]"
              />
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 w-10 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#006D77]" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── 2. RISK FILTER TABS ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(
            [
              { key: "ALL", label: "All Patients", count: patients.length },
              { key: "High", label: "High Risk Watchlist", count: highRiskCount },
              { key: "Moderate", label: "Moderate Risk", count: modRiskCount },
              {
                key: "Low",
                label: "Stable / Low Risk",
                count: patients.filter((p) => p.riskLevel === "Low").length,
              },
            ] as const
          ).map((tab) => {
            const isSelected = riskFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRiskFilter(tab.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#006D77] text-white shadow-xs"
                    : "bg-white dark:bg-[#0B1F33] text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#112A44]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── 3. PATIENTS TABLE ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0B1F33] p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Patient Name</th>
                  <th className="pb-3 px-3">Demographics</th>
                  <th className="pb-3 px-3">Primary Diagnosis</th>
                  <th className="pb-3 px-3">Risk Tier</th>
                  <th className="pb-3 px-3">Last Visit</th>
                  <th className="pb-3 px-3">Consultations</th>
                  <th className="pb-3 px-3 text-right">EHR Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredPatients.map((patient) => {
                  const isHigh = patient.riskLevel === "High";
                  const isMod = patient.riskLevel === "Moderate";

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/70 dark:hover:bg-[#112A44]/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#006D77] to-[#83C5BE] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#0B1F33] dark:text-white block">
                              {patient.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {patient.phone || patient.email || "Verified Citizen"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {patient.age ? `${patient.age} yrs` : "—"} · {patient.gender || "—"}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {patient.primaryCondition || "Routine Wellness"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isHigh
                              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                              : isMod
                              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                              : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isHigh ? "bg-rose-500" : isMod ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          {patient.riskLevel || "Low"} Risk
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                        {patient.lastVisit || "Recent"}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-200">
                        {patient.totalVisits || 1} completed
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/doctor-dashboard/patients/${patient.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#006D77] dark:text-[#83C5BE] font-bold text-xs hover:bg-[#006D77] hover:text-white transition-all shadow-xs"
                        >
                          <span>Open Full EHR</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

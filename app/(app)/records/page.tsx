"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Search,
  Calendar,
  ShieldCheck,
  Eye,
  X,
  Pill,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { AIRecordSummarizer } from "@/components/ai/AIRecordSummarizer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  medications: string;
  parsedMedications: Medication[];
  notes?: string | null;
  createdAt: string;
  pdfUrl?: string;
  doctor?: {
    id: string;
    name: string;
    email: string;
    specialization?: string;
  };
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<PrescriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PrescriptionRecord | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/prescriptions/my-prescriptions`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setRecords(data.data);
          } else {
            setRecords([]);
          }
        } else {
          setRecords([]);
        }
      } catch (err: any) {
        console.warn("Could not fetch prescriptions:", err);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const filteredRecords = records.filter((item) => {
    const matchesSearch =
      item.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.doctor?.name && item.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#263049] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            Medical Records & Prescriptions
          </h1>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Access your official digital prescriptions and consultation records safely.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0F9D8C] dark:text-[#14B8A6]" />
          <span>256-bit Encrypted Vault</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by diagnosis or doctor name..."
            className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:border-[#0F9D8C] focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {["all", "prescriptions"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filter === cat
                  ? "bg-[#0F9D8C] text-white"
                  : "border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50 dark:hover:bg-[#1C2338]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── AI REPORT ANALYZER ── */}
      <AIRecordSummarizer />

      {/* ── RECORDS GRID / LIST ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-32 rounded-md" />
              <div className="flex gap-2 pt-2 border-t border-[#E2E8F0] dark:border-[#263049]">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 flex-1 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-[#263049] bg-slate-50/50 dark:bg-[#151B2E]/60 py-20 text-center px-4">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-teal-400">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            No Medical Records Found
          </h3>
          <p className="mt-1 max-w-md text-sm text-[#64748B] dark:text-[#94A3B8]">
            When attending doctors issue digital prescriptions during your consultations, they will be securely archived here in your encrypted health vault.
          </p>
          <Link
            href="/find-doctor"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F9D8C] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0C8577] transition-colors"
          >
            Find a Doctor & Book
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((rec) => {
            const formattedDate = new Date(rec.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const medsCount = rec.parsedMedications?.length || 0;

            return (
              <div
                key={rec.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-xs transition-all hover:shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-teal-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-[#0F9D8C] dark:text-teal-300">
                      E-Prescription
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] line-clamp-2">
                    {rec.diagnosis}
                  </h3>
                  <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                    {rec.doctor?.name ? `Dr. ${rec.doctor.name}` : "Attending Doctor"}
                    {rec.doctor?.specialization && ` • ${rec.doctor.specialization}`}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Pill className="h-3 w-3 text-[#0F9D8C]" />
                      {medsCount} {medsCount === 1 ? "medication" : "medications"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 border-t border-[#E2E8F0] dark:border-[#263049] pt-4">
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#1C2338] px-3 py-2 text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#263049] cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Details
                  </button>
                  <a
                    href={`${API_BASE}/prescriptions/${rec.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0F9D8C] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0C8577] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PRESCRIPTION DETAILS MODAL ── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F9D8C]">
                  Official E-Prescription
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedRecord.diagnosis}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedRecord.doctor?.name ? `Dr. ${selectedRecord.doctor.name}` : "Doctor"} •{" "}
                  {new Date(selectedRecord.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Prescribed Medications */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Prescribed Medications
              </h4>
              <div className="space-y-2.5">
                {selectedRecord.parsedMedications?.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0f172a] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{m.name}</span>
                      <span className="text-[#0F9D8C]">{m.dosage}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Frequency: {m.frequency}</span>
                      <span>Duration: {m.duration}</span>
                    </div>
                    {m.instructions && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic pt-0.5">
                        Instructions: {m.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Notes */}
            {selectedRecord.notes && (
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Doctor Notes
                </h4>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  {selectedRecord.notes}
                </p>
              </div>
            )}

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              <a
                href={`${API_BASE}/prescriptions/${selectedRecord.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F9D8C] text-xs font-semibold text-white hover:bg-[#0C8577] transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

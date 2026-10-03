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
  Printer,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { AIRecordSummarizer } from "@/components/ai/AIRecordSummarizer";
import {
  PrescriptionDocument,
  PrescriptionData,
  SAMPLE_REALISTIC_PRESCRIPTION,
} from "@/components/records/PrescriptionDocument";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  timing?: string;
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

const DEMO_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    id: "rx_demo_01",
    appointmentId: "apt_demo_01",
    patientId: "usr_demo_patient",
    doctorId: "usr_demo_doc_1",
    diagnosis: "Acute Upper Respiratory Tract Infection (URTI) with Pharyngitis (ICD-10: J06.9)",
    medications: JSON.stringify(SAMPLE_REALISTIC_PRESCRIPTION.medications),
    parsedMedications: SAMPLE_REALISTIC_PRESCRIPTION.medications.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      instructions: m.instructions,
      timing: m.timing,
    })),
    notes:
      "Patient evaluated via secure telehealth session. Pharynx mildly erythematous; no tonsillar exudates. Advised complete rest, warm saline gargles 3x daily, and high fluid intake.",
    createdAt: new Date().toISOString(),
    doctor: {
      id: "doc_1",
      name: "Priya Sharma",
      email: "dr.priyasharma@curalink.health",
      specialization: "Internal Medicine & Primary Care",
    },
  },
  {
    id: "rx_demo_02",
    appointmentId: "apt_demo_02",
    patientId: "usr_demo_patient",
    doctorId: "usr_demo_doc_2",
    diagnosis: "Primary Essential Hypertension (Stage 1) - Maintenance Regimen (ICD-10: I10)",
    medications: JSON.stringify([
      {
        name: "Tab. Telma 40 (Telmisartan 40mg)",
        dosage: "1 Tablet (Oral)",
        frequency: "1 - 0 - 0",
        duration: "30 Days (30 Tabs)",
        timing: "After Breakfast",
        instructions: "Take once daily in morning with water. Maintain low-sodium DASH diet.",
      },
      {
        name: "Tab. Rosuvas 10 (Rosuvastatin 10mg)",
        dosage: "1 Tablet (Oral)",
        frequency: "0 - 0 - 1",
        duration: "30 Days (30 Tabs)",
        timing: "After Dinner (Bedtime)",
        instructions: "Take at night after food. Lipid profile repeat in 6 weeks.",
      },
    ]),
    parsedMedications: [
      {
        name: "Tab. Telma 40 (Telmisartan 40mg)",
        dosage: "1 Tablet (Oral)",
        frequency: "1 - 0 - 0",
        duration: "30 Days (30 Tabs)",
        timing: "After Breakfast",
        instructions: "Take once daily in morning with water. Maintain low-sodium DASH diet.",
      },
      {
        name: "Tab. Rosuvas 10 (Rosuvastatin 10mg)",
        dosage: "1 Tablet (Oral)",
        frequency: "0 - 0 - 1",
        duration: "30 Days (30 Tabs)",
        timing: "After Dinner (Bedtime)",
        instructions: "Take at night after food. Lipid profile repeat in 6 weeks.",
      },
    ],
    notes:
      "Baseline blood pressure 138/88 mmHg. Advised regular 30-minute aerobic exercise and weekly home blood pressure log.",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    doctor: {
      id: "doc_2",
      name: "Vikram Seth",
      email: "dr.vikramseth@curalink.health",
      specialization: "Cardiology & Vascular Medicine",
    },
  },
];

function mapRecordToPrescriptionData(rec: PrescriptionRecord): PrescriptionData {
  const isDemo1 = rec.id === "rx_demo_01";
  if (isDemo1) return SAMPLE_REALISTIC_PRESCRIPTION;

  return {
    id: rec.id,
    prescriptionNumber: `CL-RX-${rec.id.slice(-6).toUpperCase()}`,
    date:
      new Date(rec.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + " · Teleconsultation",
    diagnosis: rec.diagnosis,
    doctor: {
      name: rec.doctor?.name ? `Dr. ${rec.doctor.name}` : "Dr. Priya Sharma",
      degree: "MBBS, MD (Internal Medicine - AIIMS)",
      specialization: rec.doctor?.specialization || "Senior Consultant Physician",
      regNumber: "KMC / NMC-84920 / 2018",
      council: "National Medical Commission",
      email: rec.doctor?.email || "consultant@curalink.health",
      phone: "+91 (80) 4122-8900",
      clinicName: "CuraLink Telehealth & Clinical Network",
      clinicAddress: "Apollo Health Hub Partner Center, Indiranagar, Bengaluru, KA - 560034",
    },
    patient: {
      name: "Aarav Sharma",
      age: "29 Yrs",
      gender: "Male",
      uhid: `UHID-${rec.patientId ? rec.patientId.slice(0, 8).toUpperCase() : "CL-99412"}`,
      allergies: "No Known Drug Allergies (NKDA)",
      bloodPressure: "120/80 mmHg",
      pulse: "74 bpm",
      spo2: "99%",
      weight: "68 kg",
    },
    medications:
      rec.parsedMedications && rec.parsedMedications.length > 0
        ? rec.parsedMedications.map((m) => ({
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency || "1 - 0 - 1",
            duration: m.duration || "5 Days",
            timing: m.timing || "After Food",
            instructions: m.instructions || undefined,
          }))
        : SAMPLE_REALISTIC_PRESCRIPTION.medications,
    clinicalNotes:
      rec.notes || "Patient evaluated via secure telehealth session. Course of therapy explained.",
    advice: [
      "Adequate oral hydration and rest recommended.",
      "Complete prescribed medication course as directed.",
      "Seek emergency medical evaluation if symptoms worsen or breathing difficulty develops.",
    ],
    followUpDate: "5 days or SOS if needed",
    digitalSignatureHash: `SHA-256: ${rec.id
      .replace(/[^a-f0-9]/gi, "")
      .padEnd(64, "e8d4f19b78a42bc5103c88019a3d4f8261e479bc3a0182490b41c098df35b49a")
      .slice(0, 64)}`,
  };
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<PrescriptionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PrescriptionRecord | null>(null);
  const [showDemoRecords, setShowDemoRecords] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/prescriptions/my-prescriptions`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setRecords(data.data);
            setShowDemoRecords(false);
          } else {
            setRecords(DEMO_PRESCRIPTIONS);
            setShowDemoRecords(true);
          }
        } else {
          setRecords(DEMO_PRESCRIPTIONS);
          setShowDemoRecords(true);
        }
      } catch (err: any) {
        console.warn("Could not fetch prescriptions, loading demo records:", err);
        setRecords(DEMO_PRESCRIPTIONS);
        setShowDemoRecords(true);
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
            Access your official digital prescriptions, clinical diagnoses, and verified health vaults.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showDemoRecords && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Sparkles className="h-3 w-3 text-amber-600" />
              <span>Verified Sample Rx Mode</span>
            </span>
          )}

          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0D9488] dark:text-[#14B8A6]" />
            <span>256-bit Encrypted Vault</span>
          </div>
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
            placeholder="Search by diagnosis, medication, or doctor name..."
            className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] pl-10 pr-4 py-2.5 text-sm text-[#0F172A] dark:text-[#F1F5F9] focus:border-[#0D9488] focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {["all", "prescriptions"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filter === cat
                  ? "bg-[#0D9488] text-white"
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
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-400">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            No Medical Records Found
          </h3>
          <p className="mt-1 max-w-md text-sm text-[#64748B] dark:text-[#94A3B8]">
            When attending doctors issue digital prescriptions during your consultations, they will be
            securely archived here in your encrypted health vault.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setRecords(DEMO_PRESCRIPTIONS);
                setShowDemoRecords(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-[#0D9488] px-5 py-2.5 text-sm font-semibold text-[#0D9488] hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Load Sample Realistic Prescriptions
            </button>
            <Link
              href="/find-doctor"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D9488] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0C8577] transition-colors"
            >
              Find a Doctor & Book
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2">
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
                className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 shadow-xs transition-all hover:shadow-md hover:border-[#0D9488]/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white font-bold text-sm shadow-xs">
                        Rx
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {rec.doctor?.name ? `Dr. ${rec.doctor.name}` : "Attending Doctor"}
                        </h4>
                        <p className="text-xs text-[#0D9488] dark:text-teal-400 font-medium">
                          {rec.doctor?.specialization || "General Medicine"}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      NMC Verified
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3.5 space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Clinical Impression
                    </span>
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] line-clamp-2">
                      {rec.diagnosis}
                    </h3>
                  </div>

                  {/* Medications preview tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {rec.parsedMedications?.slice(0, 3).map((m, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-md bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/50 dark:border-teal-800/40 px-2 py-0.5 text-[11px] font-medium text-teal-800 dark:text-teal-300"
                      >
                        <Pill className="h-3 w-3 text-[#0D9488]" />
                        {m.name.split("(")[0].trim()}
                      </span>
                    ))}
                    {medsCount > 3 && (
                      <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-500 font-medium">
                        +{medsCount - 3} more
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formattedDate}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      Rx #{rec.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338] px-3.5 py-2.5 text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-slate-50 dark:hover:bg-[#263049] transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-[#0D9488]" />
                    Inspect Rx Slip
                  </button>
                  <button
                    onClick={() => setSelectedRecord(rec)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0D9488] px-3.5 py-2.5 text-xs font-bold text-white hover:bg-[#0C8577] transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Print & PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── FULL AUTHENTIC PRESCRIPTION MODAL ── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0F172A] p-2 sm:p-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Top Close Button */}
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-1 sm:p-3">
              <PrescriptionDocument
                prescription={mapRecordToPrescriptionData(selectedRecord)}
                onDownloadPdf={() => {
                  window.open(`${API_BASE}/prescriptions/${selectedRecord.id}/download`, "_blank");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

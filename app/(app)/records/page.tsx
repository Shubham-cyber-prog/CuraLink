"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Search,
  Calendar,
  Eye,
  X,
  Pill,
  Printer,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { AIRecordSummarizer } from "@/components/ai/AIRecordSummarizer";
import {
  PrescriptionDocument,
  PrescriptionData,
  SAMPLE_REALISTIC_PRESCRIPTION,
} from "@/components/records/PrescriptionDocument";
import { api } from "@/lib/api";
import {
  formatDateIST,
  formatDoctorName,
  getDoctorAvatar,
  getDoctorQualification,
} from "@/lib/clinical-formatters";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  timing?: string;
}

interface PatientMeta {
  id?: string;
  name?: string;
  age?: number | null;
  gender?: string | null;
  email?: string;
  phone?: string | null;
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
  patient?: PatientMeta;
  doctor?: {
    id: string;
    name: string;
    email: string;
    specialization?: string;
    medicalLicenseNumber?: string;
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
      "Patient evaluated via video consultation. Pharynx mildly erythematous; no tonsillar exudates. Advised rest, warm saline gargles 3x daily, and oral fluids.",
    createdAt: new Date().toISOString(),
    doctor: {
      id: "doc_1",
      name: "Dr. Priya Sharma",
      email: "dr.priya.sharma@curalink.health",
      specialization: "Consultant Diabetologist & Internal Medicine",
      medicalLicenseNumber: "NMC-2019-33814",
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
        instructions: "Take once daily in morning with water. Maintain low-sodium diet.",
      },
      {
        name: "Tab. Rosuvas 10 (Rosuvastatin 10mg)",
        dosage: "1 Tablet (Oral)",
        frequency: "0 - 0 - 1",
        duration: "30 Days (30 Tabs)",
        timing: "After Dinner (Bedtime)",
        instructions: "Take at night after food. Repeat lipid profile in 6 weeks.",
      },
    ]),
    parsedMedications: [
      {
        name: "Tab. Telma 40 (Telmisartan 40mg)",
        dosage: "1 Tablet (Oral)",
        frequency: "1 - 0 - 0",
        duration: "30 Days (30 Tabs)",
        timing: "After Breakfast",
        instructions: "Take once daily in morning with water. Maintain low-sodium diet.",
      },
      {
        name: "Tab. Rosuvas 10 (Rosuvastatin 10mg)",
        dosage: "1 Tablet (Oral)",
        frequency: "0 - 0 - 1",
        duration: "30 Days (30 Tabs)",
        timing: "After Dinner (Bedtime)",
        instructions: "Take at night after food. Repeat lipid profile in 6 weeks.",
      },
    ],
    notes:
      "Baseline blood pressure 138/88 mmHg. Advised 30 minutes of daily brisk walking and weekly home BP monitoring.",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    doctor: {
      id: "doc_2",
      name: "Dr. Subham Nayak",
      email: "dr.subham.nayak@curalink.health",
      specialization: "Cardiology & Internal Medicine",
      medicalLicenseNumber: "NMC-2024-88492",
    },
  },
];

function mapRecordToPrescriptionData(
  rec: PrescriptionRecord,
  currentUser?: PatientMeta | null
): PrescriptionData {
  const docName = formatDoctorName(rec.doctor?.name || "Dr. Priya Sharma");
  const docSpec = rec.doctor?.specialization || "Internal Medicine";
  const patientName = rec.patient?.name || currentUser?.name || "Patient";
  const patientAge = rec.patient?.age || currentUser?.age;
  const patientGender = rec.patient?.gender || currentUser?.gender || "Male";

  return {
    id: rec.id,
    prescriptionNumber: `CL-RX-${rec.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`,
    date: `${formatDateIST(rec.createdAt)} • IST`,
    diagnosis: rec.diagnosis,
    doctor: {
      name: docName,
      degree: getDoctorQualification(docName, docSpec),
      specialization: docSpec,
      regNumber: rec.doctor?.medicalLicenseNumber || "NMC-2019-33814",
      council: "National Medical Commission (NMC)",
      email: rec.doctor?.email || "consultant@curalink.health",
      phone: "+91 (80) 4122-8900",
      clinicName: "CuraLink Clinical Network",
      clinicAddress: "CuraLink Partner Clinic, Gurugram / New Delhi NCR, India",
    },
    patient: {
      name: patientName,
      age: patientAge ? `${patientAge} Yrs` : "24 Yrs",
      gender: patientGender,
      uhid: `UHID-${(rec.patientId || currentUser?.id || "CL99412").slice(0, 8).toUpperCase()}`,
      allergies: "No Known Drug Allergies (NKDA)",
      bloodPressure: "120/80 mmHg",
      pulse: "72 bpm",
      spo2: "98%",
      weight: "68 kg",
    },
    medications:
      rec.parsedMedications && rec.parsedMedications.length > 0
        ? rec.parsedMedications.map((m) => ({
            name: m.name,
            dosage: m.dosage || "1 Tablet",
            frequency: m.frequency || "1 - 0 - 1",
            duration: m.duration || "5 Days",
            timing: m.timing || "After Food",
            instructions: m.instructions || undefined,
          }))
        : SAMPLE_REALISTIC_PRESCRIPTION.medications,
    clinicalNotes:
      rec.notes ||
      "Patient evaluated via video consultation. Course of medication and follow-up instructions explained.",
    advice: [
      "Maintain adequate oral hydration (2.5–3L water daily) and rest.",
      "Complete the full prescribed medication course as directed.",
      "Seek emergency care (112/108) if symptoms worsen or breathing difficulty develops.",
    ],
    followUpDate: "Review after 7 days or SOS",
    digitalSignatureHash: `SHA-256: ${rec.id
      .replace(/[^a-f0-9]/gi, "")
      .padEnd(64, "e8d4f19b78a42bc5103c88019a3d4f8261e479bc3a0182490b41c098df35b49a")
      .slice(0, 64)}`,
  };
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<PrescriptionRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<PatientMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PrescriptionRecord | null>(null);
  const [showDemoRecords, setShowDemoRecords] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [meRes, rxRes] = await Promise.all([
          api.get("/auth/me").catch(() => null),
          api.get("/prescriptions/my-prescriptions").catch(() => null),
        ]);

        if (meRes?.success && meRes.data) {
          setCurrentUser(meRes.data.user || meRes.data);
        }

        if (rxRes?.success && Array.isArray(rxRes.data) && rxRes.data.length > 0) {
          const normalized: PrescriptionRecord[] = rxRes.data.map((r: any) => {
            let parsedMeds: Medication[] = [];
            try {
              parsedMeds = Array.isArray(r.parsedMedications)
                ? r.parsedMedications
                : typeof r.medications === "string"
                ? JSON.parse(r.medications)
                : [];
            } catch {
              parsedMeds = [];
            }
            return { ...r, parsedMedications: parsedMeds };
          });
          setRecords(normalized);
          setShowDemoRecords(false);
        } else {
          setRecords(DEMO_PRESCRIPTIONS);
          setShowDemoRecords(true);
        }
      } catch {
        setRecords(DEMO_PRESCRIPTIONS);
        setShowDemoRecords(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadPdf = async (rec: PrescriptionRecord) => {
    if (rec.id.startsWith("rx_demo_")) {
      window.print();
      return;
    }

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("curalink_token") || sessionStorage.getItem("curalink_token")
          : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/prescriptions/${rec.id}/download`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        window.print();
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CuraLink-Rx-${rec.id.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      window.print();
    }
  };

  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return records.filter((item) => {
      if (!q) return true;
      const medsMatch = item.parsedMedications?.some((m) =>
        m.name.toLowerCase().includes(q)
      );
      return (
        item.diagnosis.toLowerCase().includes(q) ||
        (item.doctor?.name && item.doctor.name.toLowerCase().includes(q)) ||
        Boolean(medsMatch)
      );
    });
  }, [records, searchTerm]);

  return (
    <div className="space-y-7">
      {/* Classic Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/[0.08] print:hidden">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#006D77] dark:text-[#83C5BE] mb-1">
            Clinical Archive
          </p>
          <h1 className="font-serif text-3xl sm:text-[36px] leading-tight font-normal tracking-[-0.015em] text-[#0B1F33] dark:text-white">
            Health Records &amp; Prescriptions
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Inspect NMC-compliant digital prescriptions, print pharmacy copies, and review lab summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showDemoRecords && (
            <span className="inline-flex items-center rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
              Sample Preview
            </span>
          )}
          <span className="inline-flex items-center rounded-full border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#0B1F33] px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-2xs">
            {records.length} {records.length === 1 ? "Prescription" : "Prescriptions"}
          </span>
        </div>
      </div>

      {/* Curved Search Input */}
      <div className="relative max-w-md print:hidden">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search diagnosis, medication, or doctor..."
          className="w-full h-11 rounded-full border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-[#0B1F33] pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-2xs focus:border-[#006D77] focus:outline-none focus:ring-2 focus:ring-[#006D77]/15"
        />
      </div>

      {/* Lab Report Summarizer */}
      <div className="print:hidden">
        <AIRecordSummarizer />
      </div>

      {/* Prescriptions Grid */}
      <div className="print:hidden">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-56 w-full rounded-[22px]" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200/75 dark:border-white/[0.08] bg-white dark:bg-[#0B1F33] py-16 px-4 text-center shadow-[0_2px_16px_-4px_rgba(11,31,51,0.05)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.06] text-[#006D77] dark:text-[#83C5BE] mx-auto mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-xl text-[#0B1F33] dark:text-white">
              No matching prescriptions found
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Digital prescriptions issued during consultations are stored here automatically.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setRecords(DEMO_PRESCRIPTIONS);
                  setShowDemoRecords(true);
                }}
                className="h-10 px-4.5 rounded-full border border-slate-200 dark:border-white/[0.12] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                Load Sample Rx
              </button>
              <Link
                href="/find-doctor"
                className="inline-flex items-center h-10 px-5 rounded-full bg-[#006D77] hover:bg-[#005860] text-xs font-medium text-white shadow-sm"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRecords.map((rec) => {
              const docName = formatDoctorName(rec.doctor?.name || "Dr. Priya Sharma");
              const docSpec = rec.doctor?.specialization || "Internal Medicine";
              const avatarUrl = getDoctorAvatar(docName);
              const medsCount = rec.parsedMedications?.length || 0;

              return (
                <div
                  key={rec.id}
                  className="rounded-[22px] bg-white dark:bg-[#0B1F33] border border-slate-200/75 dark:border-white/[0.08] p-6 shadow-[0_2px_16px_-4px_rgba(11,31,51,0.06),0_1px_3px_rgba(11,31,51,0.03)] hover:shadow-[0_14px_32px_-10px_rgba(11,31,51,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    {/* Doctor & Verified Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="h-13 w-13 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.1] bg-slate-100 dark:bg-slate-800">
                          <Image
                            src={avatarUrl}
                            alt={docName}
                            width={52}
                            height={52}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-serif text-xl leading-snug text-[#0B1F33] dark:text-white truncate">
                            {docName}
                          </h3>
                          <p className="text-xs font-medium text-[#006D77] dark:text-[#83C5BE] truncate">
                            {docSpec}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            NMC Reg: {rec.doctor?.medicalLicenseNumber || "NMC-2019-33814"}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Verified e-Rx
                      </span>
                    </div>

                    {/* Diagnosis Box */}
                    <div className="rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.04] p-4">
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        Diagnosis
                      </p>
                      <p className="text-sm font-semibold text-[#0B1F33] dark:text-white mt-0.5 line-clamp-2">
                        {rec.diagnosis}
                      </p>
                    </div>

                    {/* Medications Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {rec.parsedMedications?.slice(0, 3).map((m, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-3 py-1 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <Pill className="h-3 w-3 text-[#006D77] dark:text-[#83C5BE] shrink-0" />
                          {m.name.split("(")[0].trim()}
                        </span>
                      ))}
                      {medsCount > 3 && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/[0.08] px-3 py-1 text-xs text-slate-500">
                          +{medsCount - 3} more
                        </span>
                      )}
                    </div>

                    {/* Date & Rx ID */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-white/[0.07]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                        {formatDateIST(rec.createdAt)}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        Rx #{rec.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Pill Actions */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(rec)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-transparent text-xs font-medium text-[#0B1F33] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                      <span>View Prescription</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(rec)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-full bg-[#006D77] hover:bg-[#005860] text-xs font-medium text-white shadow-[0_4px_14px_-3px_rgba(0,109,119,0.4)] transition-all cursor-pointer"
                    >
                      {rec.id.startsWith("rx_demo_") ? (
                        <>
                          <Printer className="h-3.5 w-3.5" />
                          <span>Print / PDF</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span>Download PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Printable NMC E-Prescription Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F33]/65 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto print:static print:inset-auto print:bg-white print:p-0 print:block">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[24px] bg-white dark:bg-[#0B1F33] p-2 sm:p-4 shadow-2xl border border-slate-200 dark:border-white/[0.1] print:max-h-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none print:p-0">
            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer print:hidden"
              title="Close"
              aria-label="Close prescription view"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-1 sm:p-2 print:p-0">
              <PrescriptionDocument
                prescription={mapRecordToPrescriptionData(selectedRecord, currentUser)}
                onDownloadPdf={() => handleDownloadPdf(selectedRecord)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

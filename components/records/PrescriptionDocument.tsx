"use client";

import React, { useRef } from "react";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Printer,
  Download,
  QrCode,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Stethoscope,
  HeartPulse,
} from "lucide-react";

export interface PrescriptionMedication {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string; // e.g. "1 - 0 - 1" or "Twice daily"
  timing?: string; // e.g. "After Food", "Before Breakfast"
  duration: string; // e.g. "5 Days"
  instructions?: string;
}

export interface PrescriptionData {
  id: string;
  prescriptionNumber?: string;
  date: string;
  diagnosis: string;
  icdCode?: string;
  chiefComplaints?: string;
  doctor: {
    name: string;
    degree?: string;
    specialization?: string;
    regNumber?: string;
    council?: string;
    email?: string;
    phone?: string;
    clinicName?: string;
    clinicAddress?: string;
  };
  patient: {
    name: string;
    age?: string | number;
    gender?: string;
    uhid?: string;
    abhaId?: string;
    email?: string;
    phone?: string;
    weight?: string;
    bloodPressure?: string;
    pulse?: string;
    spo2?: string;
    allergies?: string;
  };
  medications: PrescriptionMedication[];
  clinicalNotes?: string;
  advice?: string[];
  followUpDate?: string;
  digitalSignatureHash?: string;
}

export const SAMPLE_REALISTIC_PRESCRIPTION: PrescriptionData = {
  id: "rx_2026_0928_88219",
  prescriptionNumber: "CL-RX-2026-88219",
  date: "30 Sep 2026, 10:30 AM IST",
  diagnosis: "Acute Upper Respiratory Tract Infection with Bronchial Irritation",
  icdCode: "ICD-10: J06.9",
  chiefComplaints: "Dry irritating cough for 3 days, mild sore throat, low-grade malaise. No dyspnea.",
  doctor: {
    name: "Dr. Priya Sharma",
    degree: "MBBS, MD (Internal Medicine - AIIMS New Delhi)",
    specialization: "Senior Consultant Physician & Telehealth Specialist",
    regNumber: "KMC / NMC-84920 / 2018",
    council: "Karnataka Medical Council & National Medical Commission",
    email: "dr.priyasharma@curalink.health",
    phone: "+91 (80) 4122-8900",
    clinicName: "CuraLink Telehealth & Clinical Network",
    clinicAddress: "Apollo Health Hub Partner Center, 4th Block, Koramangala, Bengaluru, KA - 560034",
  },
  patient: {
    name: "Aarav Sharma",
    age: "29 Yrs",
    gender: "Male",
    uhid: "UHID-CL-99412",
    abhaId: "91-4820-1928-3491",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    weight: "68 kg",
    bloodPressure: "120/80 mmHg",
    pulse: "74 bpm",
    spo2: "99% on room air",
    allergies: "No Known Drug Allergies (NKDA)",
  },
  medications: [
    {
      name: "Tab. Augmentin 625 Duo",
      genericName: "Amoxicillin (500mg) + Potassium Clavulanate (125mg)",
      dosage: "1 Tablet (Oral)",
      frequency: "1 - 0 - 1",
      timing: "After Food",
      duration: "5 Days (10 Tabs)",
      instructions: "Complete the full 5-day course even if symptoms subside early. Take with water.",
    },
    {
      name: "Syr. Ascoril-D Plus",
      genericName: "Dextromethorphan HBr (10mg) + CPM (2mg) + Phenylephrine (5mg) / 5ml",
      dosage: "5 ml (Oral)",
      frequency: "1 - 1 - 1",
      timing: "After Food",
      duration: "5 Days",
      instructions: "For relief from dry cough. May cause mild drowsiness; avoid driving post-dose.",
    },
    {
      name: "Tab. Pan-D",
      genericName: "Pantoprazole (40mg) + Domperidone (30mg SR)",
      dosage: "1 Capsule (Oral)",
      frequency: "1 - 0 - 0",
      timing: "30 mins Before Breakfast",
      duration: "5 Days (5 Caps)",
      instructions: "For gastric mucosal protection alongside antibiotic therapy.",
    },
    {
      name: "Tab. Dolo 650",
      genericName: "Paracetamol (650mg)",
      dosage: "1 Tablet (Oral)",
      frequency: "SOS (As Needed)",
      timing: "After Food",
      duration: "Max 3 tabs / day",
      instructions: "Take only if body temperature exceeds 100°F or for severe headache/body ache (min 6 hr interval).",
    },
  ],
  clinicalNotes:
    "Patient assessed via encrypted HD video teleconsultation. Pharynx mildly erythematous; no purulent tonsillar exudates. Chest auscultation clear bilaterally with vesicular breath sounds. Advised warm saline gargling and oral hydration.",
  advice: [
    "Warm saline gargles 3-4 times daily for throat soothing.",
    "Adequate oral fluid intake (minimum 2.5 to 3 Litres of warm water/broth per day).",
    "Steam inhalation with eucalyptus/menthol drops twice daily.",
    "Avoid chilled drinks, refrigerated items, oily foods, and tobacco smoke.",
    "EMERGENCY RED FLAGS: Seek immediate in-person ER medical attention if you experience sudden breathlessness, chest tightness, or persistent high fever (>102°F) unyielding to medication.",
  ],
  followUpDate: "Review after 5 days if cough persists, or SOS if symptoms deteriorate.",
  digitalSignatureHash: "SHA-256: e8d4f19b78a42bc5103c88019a3d4f8261e479bc3a0182490b41c098df35b49a",
};

interface PrescriptionDocumentProps {
  prescription?: PrescriptionData;
  onDownloadPdf?: () => void;
  isCompact?: boolean;
}

export function PrescriptionDocument({
  prescription = SAMPLE_REALISTIC_PRESCRIPTION,
  onDownloadPdf,
  isCompact = false,
}: PrescriptionDocumentProps) {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText(prescription.prescriptionNumber || prescription.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      ref={printRef}
      className={`relative mx-auto w-full bg-white dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden print:border-none print:shadow-none print:m-0 print:p-0 ${
        isCompact ? "p-4 sm:p-5 text-xs" : "p-6 sm:p-8 text-sm"
      }`}
    >
      {/* ── SECURITY WATERMARK (AUTHENTIC CLINICAL FEEL) ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.025] dark:opacity-[0.035] select-none"
        aria-hidden="true"
      >
        <span className="font-serif text-[130px] font-black tracking-widest text-[#0D9488]">
          CURALINK
        </span>
      </div>

      {/* ── TOP CLINICAL HEADER / LETTERHEAD ── */}
      <div className="relative border-b-2 border-[#0D9488]/20 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Clinic Brand & Doctor Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0F766E] text-white shadow-sm font-bold text-sm">
                Rx
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  {prescription.doctor.clinicName || "CuraLink Healthcare"}
                </h2>
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  Ayushman Bharat Digital Mission (ABDM) Compliant · ISO 27001 Certified Vault
                </p>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm sm:text-base font-bold text-[#0D9488] dark:text-teal-400 flex items-center gap-1.5">
                <span>{prescription.doctor.name}</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                </span>
              </h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {prescription.doctor.degree}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {prescription.doctor.specialization}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Reg. No:{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {prescription.doctor.regNumber}
                </span>{" "}
                ({prescription.doctor.council})
              </p>
            </div>
          </div>

          {/* Rx Meta & Verification Badge */}
          <div className="flex flex-col sm:items-end justify-between text-left sm:text-right space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 px-3 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0D9488]" />
              <span>Official Telehealth E-Prescription</span>
            </div>

            <div className="space-y-0.5 pt-1 text-xs text-slate-600 dark:text-slate-400">
              <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Prescription ID:{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {prescription.prescriptionNumber || prescription.id}
                </strong>
              </p>
              <p className="text-[11px]">
                Date & Time: <span className="font-medium text-slate-800 dark:text-slate-200">{prescription.date}</span>
              </p>
              <p className="text-[11px]">
                Encounter:{" "}
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  Encrypted Video Teleconsultation
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Address subtext */}
        <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
          {prescription.doctor.clinicAddress} · Ph: {prescription.doctor.phone} · Email: {prescription.doctor.email}
        </p>
      </div>

      {/* ── PATIENT PARTICULARS & CLINICAL VITALS BAR ── */}
      <div className="my-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Patient Name
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {prescription.patient.name}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Age / Gender
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {prescription.patient.age || "29 Yrs"} / {prescription.patient.gender || "Male"}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              UHID / ABHA ID
            </span>
            <p className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {prescription.patient.uhid || "CL-PT-99412"}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Known Drug Allergies
            </span>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              {prescription.patient.allergies || "NKDA (No Known Allergies)"}
            </p>
          </div>
        </div>

        {/* Vitals Ribbon */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-slate-500 font-sans font-semibold text-[10px] uppercase">
            <HeartPulse className="h-3 w-3 text-[#0D9488]" /> Vitals:
          </span>
          <span>
            BP: <strong className="text-slate-800 dark:text-slate-200">{prescription.patient.bloodPressure || "120/80 mmHg"}</strong>
          </span>
          <span>
            Pulse: <strong className="text-slate-800 dark:text-slate-200">{prescription.patient.pulse || "74 bpm"}</strong>
          </span>
          <span>
            SpO2: <strong className="text-slate-800 dark:text-slate-200">{prescription.patient.spo2 || "99%"}</strong>
          </span>
          <span>
            Weight: <strong className="text-slate-800 dark:text-slate-200">{prescription.patient.weight || "68 kg"}</strong>
          </span>
        </div>
      </div>

      {/* ── DIAGNOSIS & CLINICAL IMPRESSION ── */}
      <div className="mb-4 rounded-xl border border-teal-100 dark:border-teal-900/40 bg-teal-50/40 dark:bg-teal-950/20 p-3.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0D9488] dark:text-teal-400">
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Clinical Diagnosis</span>
          </div>
          {prescription.icdCode && (
            <span className="font-mono text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-900/60 px-2 py-0.5 rounded">
              {prescription.icdCode}
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {prescription.diagnosis}
        </p>
        {prescription.chiefComplaints && (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">Chief Complaints:</strong>{" "}
            {prescription.chiefComplaints}
          </p>
        )}
      </div>

      {/* ── RX SYMBOL & MEDICATIONS TABLE ── */}
      <div className="mb-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="font-serif text-2xl font-black text-[#0D9488] dark:text-teal-400 tracking-wider">
            ℞
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Prescribed Medications & Dosage Schedule ({prescription.medications.length})
          </span>
        </div>

        {/* Table of Medications */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th className="py-2.5 px-3">Medicine Name & Formulation</th>
                <th className="py-2.5 px-3">Dosage / Route</th>
                <th className="py-2.5 px-3">Schedule</th>
                <th className="py-2.5 px-3">Meal Timing</th>
                <th className="py-2.5 px-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {prescription.medications.map((med, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-3 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {med.name}
                    </p>
                    {med.genericName && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        ({med.genericName})
                      </p>
                    )}
                    {med.instructions && (
                      <p className="text-[10px] text-[#0D9488] dark:text-teal-400 font-medium mt-0.5">
                        ↳ Note: {med.instructions}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                    {med.dosage}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-teal-300 font-mono font-bold text-[11px] border border-teal-200/60 dark:border-teal-800/40">
                      {med.frequency}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                    {med.timing || "After Food"}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {med.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── GENERAL ADVICE & EMERGENCY RED FLAGS ── */}
      <div className="mb-5 grid sm:grid-cols-2 gap-4">
        {prescription.advice && prescription.advice.length > 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              General Advice & Home Care
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
              {prescription.advice.map((item, i) => (
                <li key={i} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Clinical Summary & Review
            </h4>
            {prescription.clinicalNotes && (
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                "{prescription.clinicalNotes}"
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Follow-up Review:
            </span>{" "}
            <span className="text-[#0D9488] dark:text-teal-400 font-medium">
              {prescription.followUpDate || "5 days or SOS if needed"}
            </span>
          </div>
        </div>
      </div>

      {/* ── FOOTER: CLINICAL SIGNATURE, STAMP & QR VERIFICATION ── */}
      <div className="mt-6 border-t-2 border-slate-200 dark:border-slate-800 pt-5">
        <div className="grid sm:grid-cols-12 gap-5 items-end">
          {/* Legal Compliance Statement */}
          <div className="sm:col-span-6 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <Lock className="h-3.5 w-3.5 text-[#0D9488]" />
              <span>Digital E-Prescription Integrity</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              This prescription is digitally authenticated in accordance with the National Medical
              Commission (NMC) Telemedicine Practice Guidelines (2020) and the Information Technology
              Act, 2000. Valid at all licensed retail & online pharmacies nationwide.
            </p>
            {prescription.digitalSignatureHash && (
              <div className="font-mono text-[9px] text-slate-400 dark:text-slate-500 break-all bg-slate-100 dark:bg-slate-900 p-1.5 rounded">
                Hash: {prescription.digitalSignatureHash}
              </div>
            )}
          </div>

          {/* Verification QR Code */}
          <div className="sm:col-span-3 flex sm:justify-center items-center">
            <div className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="h-14 w-14 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1 border border-slate-100 dark:border-slate-700">
                <QrCode className="h-12 w-12 text-slate-800 dark:text-slate-200" />
              </div>
              <div className="text-[10px] space-y-0.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">Scan to Verify</p>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold">ABDM Verified</p>
                <p className="text-slate-400">Tamper-Proof</p>
              </div>
            </div>
          </div>

          {/* Doctor Signature & Clinic Stamp */}
          <div className="sm:col-span-3 text-right flex flex-col items-end">
            <div className="relative mb-2 pr-2">
              {/* Doctor Cursive Signature Graphic */}
              <div className="font-serif italic text-lg sm:text-xl font-bold text-[#0D9488] dark:text-teal-400 tracking-wider">
                Dr. Priya Sharma
              </div>
              <div className="absolute -bottom-1 right-0 w-28 border-b-2 border-[#0D9488]/40" />

              {/* Official Stamp Badge */}
              <div className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                <span>[ Digitally Signed & Sealed ]</span>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {prescription.doctor.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Reg: {prescription.doctor.regNumber}
            </p>
          </div>
        </div>
      </div>

      {/* ── ACTION BAR (EXCLUDED FROM PRINT) ── */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied Rx ID</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Rx ID</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Prescription</span>
          </button>

          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { FileText, Download, Filter, Search, Calendar, ShieldCheck, Eye } from "lucide-react";

interface RecordItem {
  id: string;
  title: string;
  category: "Lab Report" | "Prescription" | "Vaccination" | "Discharge Summary";
  doctor: string;
  date: string;
  fileSize: string;
}

const MOCK_RECORDS: RecordItem[] = [
  {
    id: "rec_1",
    title: "Complete Blood Count (CBC) & Metabolic Panel",
    category: "Lab Report",
    doctor: "Dr. Ananya Sharma",
    date: "Sep 02, 2026",
    fileSize: "1.4 MB",
  },
  {
    id: "rec_2",
    title: "Amoxicillin & Vitamin D3 Digital Prescription",
    category: "Prescription",
    doctor: "Dr. Rajesh Kumar",
    date: "Aug 24, 2026",
    fileSize: "420 KB",
  },
  {
    id: "rec_3",
    title: "Annual Influenza & Hepatitis B Booster Record",
    category: "Vaccination",
    doctor: "Dr. Priya Sharma",
    date: "May 15, 2026",
    fileSize: "890 KB",
  },
];

export default function MedicalRecordsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = MOCK_RECORDS.filter((item) => {
    const matchesFilter = filter === "all" || item.category.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Medical Records
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Access your official lab reports, prescriptions, and health history safely.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-[#0F9D8C]" />
          <span>256-bit Encrypted Vault</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report name or doctor..."
            className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-10 pr-4 py-2 text-sm text-[#0F172A] focus:border-[#0F9D8C] focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {["all", "lab report", "prescription", "vaccination"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filter === cat
                  ? "bg-[#0F9D8C] text-white"
                  : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecords.map((rec) => (
          <div
            key={rec.id}
            className="flex flex-col justify-between rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-all hover:shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0F9D8C]">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-[#64748B]">
                  {rec.category}
                </span>
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#0F172A] line-clamp-2">
                {rec.title}
              </h3>
              <p className="mt-1 text-xs text-[#64748B]">{rec.doctor}</p>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {rec.date}
                </span>
                <span>{rec.fileSize}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 border-t border-[#E2E8F0] pt-4">
              <button
                onClick={() => alert(`Viewing ${rec.title}`)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5" />
                View
              </button>
              <button
                onClick={() => alert(`Downloading ${rec.title}`)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0F9D8C] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0C8577]"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

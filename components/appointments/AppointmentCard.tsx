"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  RotateCcw,
  XCircle,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  formatDateIST,
  formatDoctorName,
  getDoctorAvatar,
  getDoctorQualification,
} from "@/lib/clinical-formatters";

export interface AppointmentData {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  createdAt?: string;
  type?: string;
  prescription?: {
    id: string;
    diagnosis?: string;
  } | null;
  doctor?: {
    id?: string;
    name?: string;
    specialty?: string;
    specialization?: string;
    photoUrl?: string;
    medicalLicenseNumber?: string;
    consultationFee?: number;
  };
}

export interface AppointmentCardProps {
  appointment: AppointmentData;
  doctorFallback?: {
    name?: string;
    specialty?: string;
    photoUrl?: string;
    consultationFee?: number;
  };
  onCancel?: (appointment: AppointmentData) => void;
  showActions?: boolean;
}

export function AppointmentCard({
  appointment,
  doctorFallback,
  onCancel,
  showActions = true,
}: AppointmentCardProps) {
  const doc = appointment.doctor || doctorFallback;
  const rawName = doc?.name || "Dr. Priya Sharma";
  const isFictional = rawName.toLowerCase().includes("gregory house");
  const doctorName = isFictional ? "Dr. Priya Sharma" : formatDoctorName(rawName);
  const doctorSpecialty = isFictional
    ? "Consultant Diabetologist & Internal Medicine"
    : doc?.specialty || (doc as any)?.specialization || "Internal Medicine";
  const avatarUrl = getDoctorAvatar(doctorName, (doc as any)?.photoUrl);
  const qualification = getDoctorQualification(doctorName, doctorSpecialty);
  const licenseNumber = appointment.doctor?.medicalLicenseNumber || "NMC-2019-33814";
  const fee = appointment.doctor?.consultationFee || doctorFallback?.consultationFee || 650;

  const normalizedStatus = (appointment.status || "PENDING").toUpperCase();
  const isConfirmed = normalizedStatus === "CONFIRMED";
  const isPending = normalizedStatus === "PENDING";
  const isCompleted = normalizedStatus === "COMPLETED";
  const isCancelled = normalizedStatus === "CANCELLED";

  const formattedTime = appointment.time?.toUpperCase().includes("IST")
    ? appointment.time
    : `${appointment.time} IST`;

  return (
    <div className="bg-white dark:bg-[#0B1F33] border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
      <div className="space-y-4">
        {/* Top Row: Status Badge + IST Schedule */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            {isConfirmed && (
              <span className="inline-flex items-center rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Confirmed
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center rounded border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                Pending Doctor Confirmation
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                Completed
              </span>
            )}
            {isCancelled && (
              <span className="inline-flex items-center rounded border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                Cancelled
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {formatDateIST(appointment.date)}
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {formattedTime}
            </span>
          </div>
        </div>

        {/* Doctor Details */}
        <div className="flex items-start gap-3.5">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            <Image
              src={avatarUrl}
              alt={doctorName}
              width={48}
              height={48}
              className="h-full w-full object-cover object-top"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {doctorName}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
              {doctorSpecialty}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {qualification} &bull; NMC Reg: <span className="font-mono">{licenseNumber}</span>
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Video className="h-3.5 w-3.5 text-slate-400" />
                Video Consultation
              </span>
              <span>&bull;</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">₹{fee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status-Consistent Actions */}
      {showActions && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {isConfirmed && (
            <>
              <Link
                href={`/consultation/${appointment.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-xs font-medium text-white transition-colors whitespace-nowrap"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Join Video Call</span>
              </Link>
              <Link
                href="/messages"
                className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Message doctor"
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Link>
              {onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(appointment)}
                  className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </>
          )}

          {isPending && (
            <>
              <button
                type="button"
                disabled
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed whitespace-nowrap"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Waiting for Confirmation</span>
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(appointment)}
                  className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </>
          )}

          {isCompleted && (
            <>
              <Link
                href="/records"
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#006D77] hover:bg-[#005a63] text-xs font-medium text-white transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>View e-Rx</span>
              </Link>
              <Link
                href={`/doctors/${appointment.doctorId}/book`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Book Follow-up</span>
              </Link>
            </>
          )}

          {isCancelled && (
            <Link
              href={`/doctors/${appointment.doctorId}/book`}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1F33] text-xs font-medium text-[#006D77] dark:text-[#83C5BE] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reschedule Visit</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

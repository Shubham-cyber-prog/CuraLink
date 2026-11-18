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
  CreditCard,
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
  payment?: {
    status?: string;
    amount?: number;
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
  onPayNow?: (appointment: AppointmentData) => void;
  showActions?: boolean;
}

export function AppointmentCard({
  appointment,
  doctorFallback,
  onCancel,
  onPayNow,
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
    <div className="rounded-[22px] bg-white dark:bg-[#0B1F33] border border-slate-200/75 dark:border-white/[0.08] p-6 shadow-[0_2px_16px_-4px_rgba(11,31,51,0.06),0_1px_3px_rgba(11,31,51,0.03)] hover:shadow-[0_14px_32px_-10px_rgba(11,31,51,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-5">
      <div className="space-y-4">
        {/* Top Row: Curved Status Pill + Fee */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-100 dark:border-white/[0.07]">
          <div>
            {isConfirmed && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Confirmed
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Pending Doctor Confirmation
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                Completed
              </span>
            )}
            {isCancelled && (
              <span className="inline-flex items-center rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                Cancelled
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-[#0B1F33] dark:text-slate-200 flex items-center gap-1.5">
            <span>₹{fee}</span>
            <span className="text-slate-300 dark:text-slate-600">&bull;</span>
            {appointment.payment?.status?.toUpperCase() === "SUCCESS" ? (
              <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">Unpaid</span>
            )}
          </span>
        </div>

        {/* Doctor Details */}
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/[0.1] bg-slate-100 dark:bg-slate-800">
            <Image
              src={avatarUrl}
              alt={doctorName}
              width={56}
              height={56}
              className="h-full w-full object-cover object-top"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <h3 className="font-serif text-xl leading-snug text-[#0B1F33] dark:text-white truncate">
              {doctorName}
            </h3>
            <p className="text-xs font-medium text-[#006D77] dark:text-[#83C5BE] truncate">
              {doctorSpecialty}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {qualification} &bull; NMC Reg: <span className="font-mono">{licenseNumber}</span>
            </p>
          </div>
        </div>

        {/* Curved Schedule Pill Strip */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.04] px-4 py-3 text-xs text-slate-700 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Calendar className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
            {formatDateIST(appointment.date)}
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Curved Pill Actions */}
      {showActions && (
        <div className="pt-1 flex flex-wrap items-center gap-2">
          {isConfirmed && (
            <>
              <Link
                href={`/consultation/${appointment.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-[#006D77] hover:bg-[#005860] text-xs font-medium text-white shadow-[0_4px_14px_-3px_rgba(0,109,119,0.4)] transition-all whitespace-nowrap"
              >
                <Video className="h-3.5 w-3.5" />
                <span>Join Video Call</span>
              </Link>
              <Link
                href="/messages"
                className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
                title="Message doctor"
              >
                <MessageSquare className="h-4 w-4" />
              </Link>
              {onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(appointment)}
                  className="inline-flex items-center justify-center gap-1 h-10 px-3.5 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-transparent text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </>
          )}

          {isPending && (
            <>
              {onPayNow && appointment.payment?.status?.toUpperCase() !== "SUCCESS" ? (
                <button
                  type="button"
                  onClick={() => onPayNow(appointment)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-[#006D77] hover:bg-[#005860] text-xs font-medium text-white shadow-[0_4px_14px_-3px_rgba(0,109,119,0.4)] transition-all cursor-pointer whitespace-nowrap"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Pay ₹{fee} &amp; Confirm</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-slate-200 dark:border-white/[0.1] bg-slate-100 dark:bg-white/[0.06] text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed whitespace-nowrap"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Waiting for Confirmation</span>
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={() => onCancel(appointment)}
                  className="inline-flex items-center justify-center gap-1 h-10 px-3.5 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-transparent text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
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
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-[#006D77] hover:bg-[#005860] text-xs font-medium text-white shadow-xs transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>View e-Rx</span>
              </Link>
              <Link
                href={`/doctors/${appointment.doctorId}/book`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Book Follow-up</span>
              </Link>
            </>
          )}

          {isCancelled && (
            <Link
              href={`/doctors/${appointment.doctorId}/book`}
              className="w-full inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-transparent text-xs font-medium text-[#006D77] dark:text-[#83C5BE] hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors"
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

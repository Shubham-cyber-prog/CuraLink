"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Video, RotateCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";

export interface AppointmentData {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  createdAt?: string;
  type?: string;
  doctor?: {
    id?: string;
    name?: string;
    specialty?: string;
    specialization?: string;
    photoUrl?: string;
  };
}

export interface AppointmentCardProps {
  appointment: AppointmentData;
  doctorFallback?: {
    name?: string;
    specialty?: string;
    photoUrl?: string;
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
  const doctorName = doc?.name || "Dr. Medical Specialist";
  const doctorSpecialty =
    doc?.specialty || (doc as any)?.specialization || "Telehealth Consultation";
  const photoUrl = (doc as any)?.photoUrl;

  const normalizedStatus = (appointment.status || "CONFIRMED").toUpperCase();
  const isConfirmed = normalizedStatus === "CONFIRMED";
  const isCompleted = normalizedStatus === "COMPLETED";
  const isCancelled = normalizedStatus === "CANCELLED";

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4">
      <div>
        {/* Top status & timing */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-3.5">
          {isConfirmed && <Badge variant="verified">Confirmed</Badge>}
          {isCompleted && <Badge variant="success">Completed</Badge>}
          {isCancelled && <Badge variant="emergency">Cancelled</Badge>}
          {!isConfirmed && !isCompleted && !isCancelled && (
            <Badge variant="pending">{appointment.status}</Badge>
          )}

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {appointment.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {appointment.time}
            </span>
          </div>
        </div>

        {/* Doctor details */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#0D9488] dark:text-[#14B8A6] font-bold flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={doctorName}
                width={48}
                height={48}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{doctorName.replace("Dr. ", "").charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {doctorName}
            </p>
            <p className="truncate text-xs text-[#0D9488] dark:text-[#14B8A6] font-medium">
              {doctorSpecialty}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <Video className="h-3 w-3 text-[#0D9488]" />
              <span>Video Consultation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions toolbar */}
      {showActions && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          {isConfirmed && (
            <>
              <Button
                asChild
                size="sm"
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white"
              >
                <Link href={`/consultation/${appointment.id}`}>
                  <Video className="mr-1.5 h-3.5 w-3.5" />
                  Join Consultation
                </Link>
              </Button>
              {onCancel && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel(appointment)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-950/30"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:ml-1">Cancel</span>
                </Button>
              )}
            </>
          )}

          {isCompleted && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full text-slate-700 dark:text-slate-200 dark:border-slate-700"
            >
              <Link href={`/doctors/${appointment.doctorId}/book`}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Book Follow-up
              </Link>
            </Button>
          )}

          {isCancelled && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full text-[#0D9488] dark:text-[#14B8A6] dark:border-slate-700"
            >
              <Link href={`/doctors/${appointment.doctorId}/book`}>
                Reschedule Visit
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

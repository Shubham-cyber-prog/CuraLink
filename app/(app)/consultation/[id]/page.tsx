"use client";

import React, { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  ShieldCheck,
  PhoneOff,
  Clock,
  User,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Settings,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_DOCTORS } from "@/lib/mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ConsultationPageProps {
  params: Promise<{ id: string }>;
}

export default function ConsultationPage({ params }: ConsultationPageProps) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.id;
  const router = useRouter();

  // State
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomData, setRoomData] = useState<{
    roomUrl: string;
    token: string;
    roomName: string;
    isDoctor: boolean;
    appointment: {
      id: string;
      doctorId: string;
      userId: string;
      date: string;
      time: string;
      status: string;
    };
  } | null>(null);

  // Pre-call check state
  const [hasJoinedCall, setHasJoinedCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isEndingCall, setIsEndingCall] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // 1. Fetch Room & Token from Backend
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoadingRoom(true);
        setRoomError(null);

        // Get CSRF token
        const csrfRes = await fetch(`${API_BASE}/auth/csrf-token`);
        const csrfData = await csrfRes.json();
        const csrfToken = csrfData.token;

        const res = await fetch(`${API_BASE}/consultations/${appointmentId}/room`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          credentials: "include",
        });

        if (res.status === 401) {
          router.replace(`/login?redirect=/consultation/${appointmentId}`);
          return;
        }

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to initialize consultation room");
        }

        setRoomData(data.data);
      } catch (err: any) {
        console.error("Consultation room error:", err);
        setRoomError(err.message || "Unable to join consultation");
      } finally {
        setIsLoadingRoom(false);
      }
    };

    fetchRoom();
  }, [appointmentId, router]);

  // 2. Local Media Stream for Pre-Call Check
  useEffect(() => {
    if (isLoadingRoom || roomError || hasJoinedCall) return;

    let isMounted = true;

    async function initMedia() {
      try {
        setPermissionError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: cameraOn,
          audio: micOn,
        });

        if (isMounted) {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err: any) {
        console.warn("Media permissions error:", err);
        if (isMounted) {
          setPermissionError(
            "Camera and/or Microphone permission denied. Please allow access in your browser settings to continue."
          );
        }
      }
    }

    initMedia();

    return () => {
      isMounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
    };
  }, [isLoadingRoom, roomError, hasJoinedCall, cameraOn, micOn]);

  // Toggle local track
  const toggleCamera = () => {
    setCameraOn(!cameraOn);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOn;
      });
    }
  };

  const toggleMic = () => {
    setMicOn(!micOn);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !micOn;
      });
    }
  };

  const handleEnterCall = () => {
    // Stop local preview stream before mounting Daily iframe
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setHasJoinedCall(true);
  };

  // End & Complete Consultation
  const handleEndCall = async () => {
    if (!confirm("Are you sure you want to end this consultation?")) return;

    try {
      setIsEndingCall(true);

      const csrfRes = await fetch(`${API_BASE}/auth/csrf-token`);
      const csrfData = await csrfRes.json();

      await fetch(`${API_BASE}/consultations/${appointmentId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfData.token,
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Error completing consultation:", err);
    } finally {
      router.push("/appointments?completed=true");
    }
  };

  // Find doctor info
  const doctor = roomData ? MOCK_DOCTORS.find((d) => d.id === roomData.appointment.doctorId) : null;
  const doctorName = doctor?.name || "Dr. Consultation";
  const doctorSpecialty = doctor?.specialty || "Telehealth Specialist";

  // -------------------------------------------------------------------
  // State: Loading Room
  // -------------------------------------------------------------------
  if (isLoadingRoom) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-[#0F9D8C] mb-4 animate-pulse">
          <Video className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] mb-2">
          Connecting to Consultation Server...
        </h2>
        <p className="text-sm text-[#64748B] max-w-sm">
          Preparing your secure, HIPAA-aligned video room.
        </p>
        <Loader2 className="h-6 w-6 animate-spin text-[#0F9D8C] mt-6" />
      </div>
    );
  }

  // -------------------------------------------------------------------
  // State: Room Error (e.g. Join Window / RBAC error)
  // -------------------------------------------------------------------
  if (roomError) {
    return (
      <div className="mx-auto max-w-lg py-12 px-4">
        <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Consultation Unavailable
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {roomError}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto rounded-xl border-slate-300 bg-white"
            >
              <Link href="/appointments">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Appointments
              </Link>
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto rounded-xl bg-[#0F9D8C] hover:bg-[#0C8577]"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // State: Pre-Call Check Screen (Camera/Mic Preview)
  // -------------------------------------------------------------------
  if (!hasJoinedCall && roomData) {
    return (
      <div className="mx-auto max-w-3xl py-6 px-4">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-[#0F9D8C]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-[#0F172A]">Pre-Call Setup</h1>
            <p className="text-sm text-[#64748B]">
              Consultation with <strong className="text-slate-800">{doctorName}</strong> ({doctorSpecialty})
            </p>
          </div>

          {/* Video Preview Box */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-slate-900 aspect-video flex items-center justify-center shadow-inner">
            {cameraOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <VideoOff className="h-12 w-12" />
                <span className="text-xs font-medium">Camera is off</span>
              </div>
            )}

            {/* Media Controls Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-slate-900/80 backdrop-blur-md px-4 py-2 border border-slate-700/60 shadow-lg">
              <button
                onClick={toggleMic}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  micOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title={micOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>

              <button
                onClick={toggleCamera}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  cameraOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title={cameraOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Permission Error Banner */}
          {permissionError && (
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Device Permission Notice</p>
                <p>{permissionError}</p>
              </div>
            </div>
          )}

          {/* Join CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-4 w-4 text-[#0F9D8C]" />
              <span>Scheduled: {roomData.appointment.date} • {roomData.appointment.time}</span>
            </div>

            <Button
              onClick={handleEnterCall}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#0F9D8C] hover:bg-[#0C8577] text-sm font-semibold shadow-md shadow-[#0F9D8C]/20 transition-transform active:scale-[0.98]"
            >
              <Video className="h-4 w-4 mr-2" />
              Enter Consultation Room
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // State: Active Call Room (Daily Prebuilt Embed)
  // -------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Top Consultation Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-3.5 px-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 font-bold text-[#0F9D8C]">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <span>{doctorName}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Call
              </span>
            </h1>
            <p className="text-xs text-[#64748B]">{doctorSpecialty}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-[#0F9D8C]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>HIPAA-Eligible Telehealth</span>
          </div>

          <Button
            onClick={handleEndCall}
            disabled={isEndingCall}
            variant="destructive"
            className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold shadow-xs"
          >
            <PhoneOff className="h-4 w-4 mr-1.5" />
            {isEndingCall ? "Ending..." : "End Consultation"}
          </Button>
        </div>
      </div>

      {/* Daily Prebuilt Call Iframe Embed */}
      {roomData && (
        <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-slate-950 shadow-md">
          <iframe
            src={`${roomData.roomUrl}?token=${roomData.token}&theme=light&lang=en`}
            className="w-full h-[calc(100vh-210px)] min-h-[550px] border-none"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            title="Daily.co Video Consultation"
          />
        </div>
      )}
    </div>
  );
}

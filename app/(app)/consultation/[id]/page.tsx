"use client";

import React, { useEffect, useState, useRef, use } from "react";
import dynamic from "next/dynamic";
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
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Maximize2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Client-only dynamic import of JitsiMeeting to prevent any SSR window undefined errors
const JitsiMeeting = dynamic(
  () => import("@jitsi/react-sdk").then((mod) => mod.JitsiMeeting),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[580px] h-[calc(100vh-210px)] bg-slate-950 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F9D8C] mb-3" />
        <p className="text-xs font-medium">Initializing encrypted Jitsi Meet video session...</p>
      </div>
    ),
  }
);

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
    roomName: string;
    userName?: string;
    isDoctor: boolean;
    doctor?: {
      id: string;
      name: string;
      specialty: string;
    };
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

  // 1. Fetch Room Name from Backend
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoadingRoom(true);
        setRoomError(null);

        const res = await fetch(`${API_BASE}/appointments/${appointmentId}/join`, {
          method: "GET",
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

  // 2. Local Media Stream for Pre-Call Readiness Check
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
            "Camera and/or Microphone permission denied. Please allow device access in your browser to continue."
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
    // Release preview stream before entering Jitsi frame
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setHasJoinedCall(true);
  };

  // End & Complete Consultation -> Redirect to Dashboard
  const handleEndCall = async () => {
    try {
      setIsEndingCall(true);

      await fetch(`${API_BASE}/consultations/${appointmentId}/complete`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } catch (err) {
      console.error("Error completing consultation:", err);
    } finally {
      // Redirect to appropriate dashboard
      router.push(roomData?.isDoctor ? "/doctor-dashboard" : "/dashboard");
    }
  };

  // Real metadata
  const doctorName = roomData?.doctor?.name || "Dr. Consultation";
  const doctorSpecialty = roomData?.doctor?.specialty || "Telehealth Specialist";
  const callUrl = roomData?.roomUrl || (roomData?.roomName ? `https://meet.jit.si/${roomData.roomName}` : "");
  const participantName = roomData?.userName || (roomData?.isDoctor ? doctorName : "Patient");

  // -------------------------------------------------------------------
  // State: Loading Room
  // -------------------------------------------------------------------
  if (isLoadingRoom) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-teal-400 mb-4 animate-pulse">
          <Video className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-2">
          Connecting to Consultation Room...
        </h2>
        <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-sm">
          Preparing your secure, encrypted Jitsi Meet telehealth session.
        </p>
        <Loader2 className="h-6 w-6 animate-spin text-[#0F9D8C] dark:text-teal-400 mt-6" />
      </div>
    );
  }

  // -------------------------------------------------------------------
  // State: Room Error
  // -------------------------------------------------------------------
  if (roomError || !roomData) {
    return (
      <div className="mx-auto max-w-lg py-12 px-4">
        <div className="rounded-3xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 p-6 sm:p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#F1F5F9] mb-2">
            Consultation Unavailable
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            {roomError || "Unable to load consultation details."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto rounded-xl border-slate-300 dark:border-[#263049] bg-white dark:bg-[#151B2E] text-slate-700 dark:text-slate-300"
            >
              <Link href="/appointments">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Appointments
              </Link>
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto rounded-xl bg-[#085041] hover:bg-[#06382e] text-white"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // State: Pre-Call Setup Screen (Device Readiness)
  // -------------------------------------------------------------------
  if (!hasJoinedCall) {
    return (
      <div className="mx-auto max-w-3xl py-6 px-4">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/appointments"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-[#F1F5F9]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 text-xs font-medium text-[#0F9D8C] dark:text-teal-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">Pre-Call Setup</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400">
              Consultation with <strong className="text-slate-800 dark:text-slate-200">{doctorName}</strong> ({doctorSpecialty})
            </p>
          </div>

          {/* Video Preview Box */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-slate-900 aspect-video flex items-center justify-center shadow-inner">
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-slate-900 px-4 py-2 border border-slate-700/60 shadow-lg">
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
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Device Permission Notice</p>
                <p>{permissionError}</p>
              </div>
            </div>
          )}

          {/* Join CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="h-4 w-4 text-[#0F9D8C] dark:text-teal-400" />
              <span>Scheduled: {roomData.appointment.date} • {roomData.appointment.time}</span>
            </div>

            <Button
              onClick={handleEnterCall}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#085041] hover:bg-[#06382e] dark:bg-teal-600 dark:hover:bg-teal-500 text-sm font-semibold shadow-md shadow-[#085041]/20 transition-transform active:scale-[0.98] text-white"
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
  // State: Active Call Room (Embedded Jitsi Meet via @jitsi/react-sdk)
  // -------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Top Consultation Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-3.5 px-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 font-bold text-[#0F9D8C] dark:text-teal-400">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] flex items-center gap-2">
              <span>{doctorName}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Call
              </span>
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400">{doctorSpecialty}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 text-xs font-semibold text-[#0F9D8C] dark:text-teal-400">
            <Lock className="h-3.5 w-3.5" />
            <span>HIPAA Telehealth</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(callUrl, "_blank")}
            className="hidden md:inline-flex rounded-xl text-xs font-semibold border-slate-300 dark:border-slate-700"
            title="Open consultation in full separate window"
          >
            <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
            Pop Out
          </Button>

          <Button
            onClick={handleEndCall}
            disabled={isEndingCall}
            variant="default"
            className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold shadow-xs text-white"
          >
            <PhoneOff className="h-4 w-4 mr-1.5" />
            {isEndingCall ? "Ending..." : "End Consultation"}
          </Button>
        </div>
      </div>

      {/* Embedded Jitsi Meet Call Frame */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-slate-950 shadow-md min-h-[580px] h-[calc(100vh-210px)]">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomData.roomName}
          configOverwrite={{
            startWithAudioMuted: !micOn,
            startWithVideoMuted: !cameraOn,
            disableDeepLinking: true,
            prejoinPageEnabled: false,
            enableClosePage: false,
            toolbarButtons: [
              "camera",
              "chat",
              "closedcaptions",
              "desktop",
              "filmstrip",
              "fullscreen",
              "hangup",
              "microphone",
              "participants-pane",
              "profile",
              "raisehand",
              "settings",
              "tileview",
              "toggle-camera",
              "videoquality",
            ],
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            HIDE_DEEP_LINKING_LOGO: true,
          }}
          userInfo={{
            displayName: participantName,
            email: "",
          }}
          onReadyToClose={handleEndCall}
          getIFrameRef={(iframeRef) => {
            if (iframeRef) {
              iframeRef.style.height = "100%";
              iframeRef.style.width = "100%";
              iframeRef.style.minHeight = "580px";
              iframeRef.style.border = "none";
            }
          }}
          spinner={() => (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-[#0F9D8C] mb-3" />
              <p className="text-xs text-slate-400 font-medium">Connecting to Jitsi Meet video stream...</p>
            </div>
          )}
        />
      </div>
    </div>
  );
}

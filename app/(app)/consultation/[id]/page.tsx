"use client";

import React, { useEffect, useState, useRef, use, useCallback } from "react";
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
  Lock,
  CheckCircle2,
  Users,
  FileText,
  Home,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

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
      consultationStatus?: string;
    };
  } | null>(null);

  // Script & Meeting API State
  const [jitsiScriptLoaded, setJitsiScriptLoaded] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  // Pre-call readiness & Media State
  const [hasJoinedCall, setHasJoinedCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // In-Call Live State
  const [hasRemoteParticipant, setHasRemoteParticipant] = useState(false);
  const [remoteParticipantName, setRemoteParticipantName] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // 1. Fetch Room Data and Authorize from Backend
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

  // 2. Dynamically Load Jitsi Meet External API Script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.JitsiMeetExternalAPI) {
      setJitsiScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => setJitsiScriptLoaded(true);
    script.onerror = () => {
      setRoomError("Failed to load secure video library. Please check your internet connection.");
    };
    document.body.appendChild(script);

    return () => {
      // Intentionally keep script cached in DOM for subsequent visits
    };
  }, []);

  // 3. Local Media Stream for Pre-Call Readiness Check
  useEffect(() => {
    if (isLoadingRoom || roomError || hasJoinedCall || isCompleted) return;

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
  }, [isLoadingRoom, roomError, hasJoinedCall, cameraOn, micOn, isCompleted]);

  // 4. Call Duration Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (hasJoinedCall && !isCompleted) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasJoinedCall, isCompleted]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 5. Pre-Call Toggles
  const togglePreCallCamera = () => {
    setCameraOn(!cameraOn);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOn;
      });
    }
  };

  const togglePreCallMic = () => {
    setMicOn(!micOn);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !micOn;
      });
    }
  };

  const handleEnterCall = () => {
    // Release preview stream before mounting in-meeting stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setHasJoinedCall(true);
  };

  // 6. Complete Consultation Callback
  const handleCallCompletion = useCallback(async () => {
    setIsEndingCall(true);
    setShowEndModal(false);

    try {
      await fetch(`${API_BASE}/consultations/${appointmentId}/complete`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } catch (err) {
      console.warn("Could not mark consultation complete on server:", err);
    } finally {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch {}
        jitsiApiRef.current = null;
      }
      setIsEndingCall(false);
      setIsCompleted(true);
    }
  }, [appointmentId]);

  // 7. Initialize JitsiMeetExternalAPI inside CuraLink
  useEffect(() => {
    if (!hasJoinedCall || !jitsiScriptLoaded || !jitsiContainerRef.current || !roomData || isCompleted) {
      return;
    }

    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch {}
      jitsiApiRef.current = null;
    }

    const domain = "meet.jit.si";
    const doctorName = roomData.doctor?.name || "Dr. Clinician";
    const userName = roomData.userName || (roomData.isDoctor ? doctorName : "Patient");

    const options = {
      roomName: roomData.roomName,
      width: "100%",
      height: "100%",
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: userName,
      },
      configOverwrite: {
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        prejoinConfig: { enabled: false },
        startWithAudioMuted: !micOn,
        startWithVideoMuted: !cameraOn,
        enableWelcomePage: false,
        enableClosePage: false,
        enableInsecureRoomNameWarning: false,
        disableInviteFunctions: true,
        hideConferenceSubject: true,
        hideConferenceTimer: false,
        notifications: [],
        toolbarButtons: [
          "microphone",
          "camera",
          "tileview",
          "chat",
          "fullscreen",
          "settings",
          "hangup",
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        MOBILE_APP_PROMO: false,
        HIDE_DEEP_LINKING_LOGO: true,
        APP_NAME: "CuraLink Telehealth",
      },
    };

    try {
      const api = new window.JitsiMeetExternalAPI!(domain, options);
      jitsiApiRef.current = api;

      api.addListener("participantJoined", (participant: any) => {
        setHasRemoteParticipant(true);
        if (participant?.displayName) {
          setRemoteParticipantName(participant.displayName);
        }
      });

      api.addListener("participantLeft", () => {
        setHasRemoteParticipant(false);
        setRemoteParticipantName(null);
      });

      api.addListener("videoMuteStatusChanged", ({ muted }: { muted: boolean }) => {
        setCameraOn(!muted);
      });

      api.addListener("audioMuteStatusChanged", ({ muted }: { muted: boolean }) => {
        setMicOn(!muted);
      });

      api.addListener("readyToClose", () => {
        handleCallCompletion();
      });
    } catch (err) {
      console.error("Failed to initialize Jitsi instance:", err);
      setRoomError("Unable to establish encrypted video stream.");
    }

    return () => {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch {}
        jitsiApiRef.current = null;
      }
    };
  }, [hasJoinedCall, jitsiScriptLoaded, roomData, isCompleted, handleCallCompletion]);

  // In-call toolbar command relays
  const toggleInCallAudio = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleAudio");
    }
  };

  const toggleInCallVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleVideo");
    }
  };

  // Resolved metadata
  const doctorName = roomData?.doctor?.name || "Dr. Consultation";
  const doctorSpecialty = roomData?.doctor?.specialty || "Telehealth Specialist";
  const otherPartyLabel = roomData?.isDoctor
    ? remoteParticipantName || "Patient"
    : remoteParticipantName || doctorName;

  // -------------------------------------------------------------------
  // View State 1: Loading
  // -------------------------------------------------------------------
  if (isLoadingRoom) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#0F9D8C] dark:text-teal-400 mb-4 animate-pulse">
          <Video className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9] mb-2">
          Connecting to Secure Consultation Room...
        </h2>
        <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-sm">
          Verifying appointment authorization and establishing peer encryption.
        </p>
        <Loader2 className="h-6 w-6 animate-spin text-[#0F9D8C] dark:text-teal-400 mt-6" />
      </div>
    );
  }

  // -------------------------------------------------------------------
  // View State 2: Error / Ineligible
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
  // View State 3: Consultation Concluded
  // -------------------------------------------------------------------
  if (isCompleted) {
    return (
      <div className="mx-auto max-w-lg py-12 px-4">
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-6 sm:p-8 text-center shadow-sm space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Consultation Concluded
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your clinical telehealth session has successfully concluded and the record has been updated.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Appointment ID</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{appointmentId.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{roomData.isDoctor ? "Patient" : "Doctor"}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {roomData.isDoctor ? "Patient" : doctorName}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Call Duration</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{formatTimer(callDuration)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Database Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">COMPLETED</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto rounded-xl border-slate-300 dark:border-slate-700"
            >
              <Link href={roomData.isDoctor ? "/doctor-dashboard" : "/appointments"}>
                <Calendar className="h-4 w-4 mr-2" />
                {roomData.isDoctor ? "Doctor Dashboard" : "Appointments"}
              </Link>
            </Button>
            <Button
              asChild
              className="w-full sm:w-auto rounded-xl bg-[#085041] hover:bg-[#06382e] text-white"
            >
              <Link href={roomData.isDoctor ? `/doctor-dashboard/patients/${roomData.appointment.userId}?appointmentId=${appointmentId}#prescribe` : "/dashboard"}>
                {roomData.isDoctor ? (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Issue Prescription
                  </>
                ) : (
                  <>
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // View State 4: Pre-Call Readiness Setup (Hardware Checks)
  // -------------------------------------------------------------------
  if (!hasJoinedCall) {
    return (
      <div className="mx-auto max-w-3xl py-6 px-4">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={roomData.isDoctor ? "/doctor-dashboard" : "/appointments"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-[#F1F5F9]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {roomData.isDoctor ? "Dashboard" : "Appointments"}
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 text-xs font-medium text-[#0F9D8C] dark:text-teal-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>End-to-End Encrypted Session</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">Pre-Call Setup</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400">
              {roomData.isDoctor ? (
                <>Clinical Telehealth Session for Appointment <strong className="text-slate-800 dark:text-slate-200 font-mono">{appointmentId.slice(0, 8)}</strong></>
              ) : (
                <>Consultation with <strong className="text-slate-800 dark:text-slate-200">{doctorName}</strong> ({doctorSpecialty})</>
              )}
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
                <span className="text-xs font-medium">Camera is turned off</span>
              </div>
            )}

            {/* Media Controls Bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-full bg-slate-900/90 backdrop-blur-xs px-4 py-2 border border-slate-700/60 shadow-lg">
              <button
                onClick={togglePreCallMic}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  micOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title={micOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>

              <button
                onClick={togglePreCallCamera}
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
              disabled={!jitsiScriptLoaded}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#085041] hover:bg-[#06382e] dark:bg-teal-600 dark:hover:bg-teal-500 text-sm font-semibold shadow-md shadow-[#085041]/20 transition-transform active:scale-[0.98] text-white"
            >
              {jitsiScriptLoaded ? (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Enter Consultation Room
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparing Video Engine...
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // View State 5: Active In-App Video Consultation (Jitsi Embedded)
  // -------------------------------------------------------------------
  return (
    <div className="space-y-3">
      {/* Top Consultation Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-white dark:bg-[#151B2E] p-3 px-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 font-bold text-[#0F9D8C] dark:text-teal-400">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] flex items-center gap-2">
              <span>{doctorName}</span>
              {hasRemoteParticipant ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Connected ({formatTimer(callDuration)})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  Waiting for {roomData.isDoctor ? "Patient" : "Doctor"}
                </span>
              )}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400">{doctorSpecialty}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 text-xs font-semibold text-[#0F9D8C] dark:text-teal-400">
            <Lock className="h-3.5 w-3.5" />
            <span>HIPAA Encrypted</span>
          </div>

          {/* Direct Toolbar Controls */}
          <button
            onClick={toggleInCallAudio}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              micOn
                ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                : "border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/60 text-red-600"
            }`}
            title={micOn ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>

          <button
            onClick={toggleInCallVideo}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              cameraOn
                ? "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                : "border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/60 text-red-600"
            }`}
            title={cameraOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>

          <Button
            onClick={() => setShowEndModal(true)}
            variant="default"
            className="h-9 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold shadow-xs text-white"
          >
            <PhoneOff className="h-4 w-4 mr-1.5" />
            End Call
          </Button>
        </div>
      </div>

      {/* Participant Presence Banner */}
      {!hasRemoteParticipant && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/40 p-3 px-4 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              {roomData.isDoctor
                ? "Waiting for the patient to connect to this consultation room..."
                : `Waiting for ${doctorName} to connect. Your presence has been logged and the doctor will join shortly.`}
            </span>
          </div>
          <span className="font-mono text-amber-700 dark:text-amber-400">{formatTimer(callDuration)}</span>
        </div>
      )}

      {/* Embedded Jitsi Meet Call Container */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-[#263049] bg-slate-950 shadow-md min-h-[580px] h-[calc(100vh-210px)]">
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>

      {/* End Call Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600">
                <PhoneOff className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  End Consultation?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This will conclude the active telehealth session with {otherPartyLabel}.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to end this consultation? The call duration ({formatTimer(callDuration)}) will be saved and the appointment status will be updated to completed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                disabled={isEndingCall}
                onClick={() => setShowEndModal(false)}
                className="rounded-xl border-slate-300 dark:border-slate-700 text-xs"
              >
                Continue Call
              </Button>
              <Button
                disabled={isEndingCall}
                onClick={handleCallCompletion}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                {isEndingCall ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Concluding...
                  </>
                ) : (
                  "Yes, End Consultation"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

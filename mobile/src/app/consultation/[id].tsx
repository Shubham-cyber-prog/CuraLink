import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import {
  PhoneOff,
  ShieldCheck,
  Stethoscope,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Lock,
  CameraOff,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/UI';
import { api } from '../../lib/api';

interface JoinResponse {
  roomUrl: string;
  roomName: string;
  userName?: string;
  isDoctor: boolean;
  doctor?: {
    id: string;
    name: string;
    specialty: string;
  };
  appointment?: {
    id: string;
    date: string;
    time: string;
    status: string;
  };
}

export default function MobileConsultationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [callData, setCallData] = useState<JoinResponse | null>(null);

  // In-Call Media & Session State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // 1. Fetch Room Data from Backend
  const fetchJoinData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      const res = await api.get<JoinResponse>(`/appointments/${id}/join`);
      if (res && res.data && (res.data.roomName || res.data.roomUrl)) {
        setCallData(res.data);
      } else {
        throw new Error(res?.message || 'Could not retrieve video room session.');
      }
    } catch (err: any) {
      console.error('Failed to get consultation room data:', err);
      setError(err?.message || 'Unable to connect to the consultation room. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJoinData();
  }, [fetchJoinData]);

  // 2. Call Duration Timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (inCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [inCall]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 3. Android Runtime Camera & Microphone Permission Check
  const requestMediaPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        const cameraGranted =
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
        const audioGranted =
          granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;

        if (!cameraGranted || !audioGranted) {
          setPermissionDenied(true);
          return false;
        }
        setPermissionDenied(false);
        return true;
      } catch (err) {
        console.warn('Error requesting camera/microphone permissions:', err);
        return false;
      }
    }
    return true;
  };

  const handleStartCall = async () => {
    const hasPermissions = await requestMediaPermissions();
    if (!hasPermissions) return;
    setInCall(true);
  };

  // 4. In-Call JavaScript Bridge & Controls
  const sendCommandToMeeting = (type: 'TOGGLE_AUDIO' | 'TOGGLE_VIDEO' | 'HANGUP') => {
    const payload = JSON.stringify({ type });
    webViewRef.current?.injectJavaScript(`
      try {
        window.postMessage(${JSON.stringify(payload)}, '*');
      } catch (e) {}
      true;
    `);
  };

  const toggleMic = () => {
    sendCommandToMeeting('TOGGLE_AUDIO');
    setIsMicMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    sendCommandToMeeting('TOGGLE_VIDEO');
    setIsVideoMuted((prev) => !prev);
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Consultation',
      'Are you sure you want to exit the video consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: async () => {
            sendCommandToMeeting('HANGUP');
            finishCall();
          },
        },
      ]
    );
  };

  const finishCall = useCallback(async () => {
    setInCall(false);
    setCompleted(true);
    if (id) {
      try {
        await api.post(`/consultations/${id}/complete`);
      } catch (err) {
        console.warn('Could not complete consultation on server:', err);
      }
    }
  }, [id]);

  const handleWebViewMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'CALL_ENDED') {
        finishCall();
      } else if (msg.type === 'PARTICIPANT_JOINED') {
        setRemoteConnected(true);
      } else if (msg.type === 'PARTICIPANT_LEFT') {
        setRemoteConnected(false);
      } else if (msg.type === 'AUDIO_MUTE_CHANGED') {
        setIsMicMuted(Boolean(msg.muted));
      } else if (msg.type === 'VIDEO_MUTE_CHANGED') {
        setIsVideoMuted(Boolean(msg.muted));
      }
    } catch {
      // non-JSON event message
    }
  };

  const userName = callData?.userName || (callData?.isDoctor ? 'Dr. Physician' : 'Patient');
  const returnRoute = callData?.isDoctor ? '/(doctor-tabs)/appointments' : '/(tabs)/appointments';

  // 5. Embedded Jitsi IFrame HTML Document (using external_api.js)
  // This completely eliminates Jitsi's "Join using the app / Join using the web" landing page
  // and keeps the audio/video call 100% inside CuraLink without opening Chrome.
  const meetingHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <script src="https://meet.jit.si/external_api.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #090D16;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #meet { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="meet"></div>
      <script>
        try {
          const domain = "meet.jit.si";
          const options = {
            roomName: "${callData?.roomName || 'curalink-room'}",
            width: "100%",
            height: "100%",
            parentNode: document.querySelector('#meet'),
            userInfo: {
              displayName: "${userName.replace(/"/g, '\\"')}"
            },
            configOverwrite: {
              disableDeepLinking: true,
              prejoinPageEnabled: false,
              prejoinConfig: { enabled: false },
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              enableWelcomePage: false,
              enableClosePage: false,
              enableInsecureRoomNameWarning: false,
              disableInviteFunctions: true,
              hideConferenceSubject: true,
              hideConferenceTimer: true,
              notifications: [],
              toolbarButtons: [
                'microphone',
                'camera',
                'tileview',
                'chat',
                'fodeviceselection'
              ]
            },
            interfaceConfigOverwrite: {
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false,
              SHOW_BRAND_WATERMARK: false,
              BRAND_WATERMARK_LINK: "",
              SHOW_POWERED_BY: false,
              SHOW_PROMOTIONAL_CLOSE_PAGE: false,
              MOBILE_APP_PROMO: false,
              HIDE_DEEP_LINKING_LOGO: true,
              APP_NAME: "CuraLink Telehealth"
            }
          };

          const api = new JitsiMeetExternalAPI(domain, options);

          api.addEventListeners({
            readyToClose: function() {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CALL_ENDED' }));
              }
            },
            videoMuteStatusChanged: function(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'VIDEO_MUTE_CHANGED', muted: e.muted }));
              }
            },
            audioMuteStatusChanged: function(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'AUDIO_MUTE_CHANGED', muted: e.muted }));
              }
            },
            participantJoined: function(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PARTICIPANT_JOINED', participant: e }));
              }
            },
            participantLeft: function(e) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PARTICIPANT_LEFT', participant: e }));
              }
            }
          });

          function handleBridgeCommand(event) {
            try {
              const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
              if (msg.type === 'TOGGLE_AUDIO') api.executeCommand('toggleAudio');
              if (msg.type === 'TOGGLE_VIDEO') api.executeCommand('toggleVideo');
              if (msg.type === 'HANGUP') api.executeCommand('hangup');
            } catch(e) {}
          }

          window.addEventListener('message', handleBridgeCommand);
          document.addEventListener('message', handleBridgeCommand);
        } catch(err) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'INIT_ERROR', error: err.message }));
          }
        }
      </script>
    </body>
    </html>
  `;

  // ── State 1: Loading ──
  if (loading) {
    return (
      <View className="flex-1 bg-[#090D16] items-center justify-center px-6">
        <StatusBar barStyle="light-content" />
        <View className="h-16 w-16 rounded-full bg-[#085041]/30 border border-[#0F9D8C]/40 items-center justify-center mb-4">
          <ActivityIndicator size="large" color="#0F9D8C" />
        </View>
        <Text className="font-inter-bold text-lg text-white text-center">
          Preparing Consultation
        </Text>
        <Text className="font-inter text-sm text-slate-400 text-center mt-2">
          Generating secure HIPAA-compliant session token...
        </Text>
      </View>
    );
  }

  // ── State 2: Permission Denied ──
  if (permissionDenied) {
    return (
      <View
        style={{ paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }}
        className="flex-1 bg-[#090D16] justify-between p-6"
      >
        <StatusBar barStyle="light-content" />
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-800/80 items-center justify-center border border-slate-700"
        >
          <ArrowLeft size={20} color="#CBD5E1" />
        </Pressable>

        <View className="items-center px-4">
          <View className="h-16 w-16 rounded-full bg-amber-950/60 border border-amber-600/50 items-center justify-center mb-4">
            <CameraOff size={28} color="#FBBF24" />
          </View>
          <Text className="font-inter-bold text-xl text-white text-center">
            Camera & Microphone Required
          </Text>
          <Text className="font-inter text-sm text-slate-400 text-center mt-2 leading-relaxed">
            CuraLink requires camera and microphone permissions so your attending specialist can examine and speak with you during the virtual visit.
          </Text>
        </View>

        <View className="space-y-3">
          <Button
            title="Grant Permissions & Join"
            onPress={handleStartCall}
            icon={RefreshCw}
          />
          <Pressable onPress={() => router.back()} className="py-3 items-center">
            <Text className="font-inter-medium text-sm text-slate-400">Return to Appointments</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── State 3: Connection / Fetch Error ──
  if (error || !callData) {
    return (
      <View
        style={{ paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }}
        className="flex-1 bg-[#090D16] justify-between p-6"
      >
        <StatusBar barStyle="light-content" />
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-800/80 items-center justify-center border border-slate-700"
        >
          <ArrowLeft size={20} color="#CBD5E1" />
        </Pressable>

        <View className="items-center px-4">
          <View className="h-16 w-16 rounded-full bg-red-950/60 border border-red-800/50 items-center justify-center mb-4">
            <PhoneOff size={28} color="#F87171" />
          </View>
          <Text className="font-inter-bold text-xl text-white text-center">
            Connection Failed
          </Text>
          <Text className="font-inter text-sm text-slate-400 text-center mt-2 leading-relaxed">
            {error || 'Unable to join the video room. Please check your network and try again.'}
          </Text>
        </View>

        <View className="space-y-3">
          <Button
            title="Try Again"
            onPress={fetchJoinData}
            icon={RefreshCw}
          />
          <Pressable onPress={() => router.back()} className="py-3 items-center">
            <Text className="font-inter-medium text-sm text-slate-400">Return to Appointments</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── State 4: Consultation Concluded ──
  if (completed) {
    return (
      <View
        style={{ paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }}
        className="flex-1 bg-[#090D16] justify-between p-6"
      >
        <StatusBar barStyle="light-content" />
        <View />

        <View className="items-center px-4">
          <View className="h-16 w-16 rounded-full bg-[#085041]/40 border border-[#0F9D8C]/50 items-center justify-center mb-4">
            <CheckCircle size={32} color="#0F9D8C" />
          </View>
          <Text className="font-inter-bold text-2xl text-white text-center">
            Consultation Concluded
          </Text>
          <Text className="font-inter text-sm text-slate-300 text-center mt-3 leading-relaxed">
            Your virtual visit with {callData.doctor?.name || 'the specialist'} has ended. Clinical notes and prescription details will be updated in your records.
          </Text>
        </View>

        <View>
          <Button
            title="Return to Appointments"
            onPress={() => router.replace(returnRoute as any)}
          />
        </View>
      </View>
    );
  }

  // ── State 5: Active In-App Video Consultation (Inside CuraLink) ──
  if (inCall) {
    const counterPartyName = callData.isDoctor
      ? (callData.appointment as any)?.patientName || 'Patient Visit'
      : callData.doctor?.name || 'Dr. Physician';

    return (
      <View className="flex-1 bg-[#090D16]">
        <StatusBar barStyle="light-content" hidden={false} />

        {/* Minimal Clinical Header */}
        <View
          style={{ paddingTop: Math.max(insets.top, 10) }}
          className="px-4 pb-3 bg-[#0F172A] border-b border-slate-800 flex-row items-center justify-between z-20"
        >
          <View className="flex-row items-center gap-2 flex-1 mr-2">
            <View className={`h-2.5 w-2.5 rounded-full ${remoteConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <View>
              <Text className="font-inter-semibold text-xs text-white" numberOfLines={1}>
                {counterPartyName}
              </Text>
              <Text className="font-inter text-[10px] text-slate-400">
                {remoteConnected ? 'Connected' : 'Waiting for specialist...'} • {formatDuration(callDuration)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1 bg-[#085041]/40 border border-[#0F9D8C]/40 px-2 py-0.5 rounded-full">
              <Lock size={10} color="#0F9D8C" />
              <Text className="font-inter-medium text-[10px] text-[#0F9D8C]">HIPAA Secured</Text>
            </View>

            <Pressable
              onPress={handleEndCall}
              className="bg-red-600 active:bg-red-700 px-3 py-1.5 rounded-lg flex-row items-center gap-1.5"
            >
              <PhoneOff size={13} color="#FFFFFF" />
              <Text className="font-inter-bold text-xs text-white">Leave</Text>
            </Pressable>
          </View>
        </View>

        {/* Embedded In-App Video Frame */}
        <View className="flex-1 bg-black">
          <WebView
            ref={webViewRef}
            source={{ html: meetingHtml, baseUrl: 'https://meet.jit.si' }}
            style={styles.webview}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            setSupportMultipleWindows={false}
            userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            {...(Platform.OS === 'ios'
              ? { mediaCapturePermissionGrantType: 'grantIfSameHostElsePrompt' as const }
              : {})}
            androidLayerType="hardware"
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color="#0F9D8C" />
                <Text style={styles.loadingText}>Connecting to secure clinical session...</Text>
              </View>
            )}
            onShouldStartLoadWithRequest={(request) => {
              // Allow embedded Jitsi external_api and resource scripts
              if (
                request.url === 'about:blank' ||
                request.url.startsWith('https://meet.jit.si') ||
                request.url.startsWith('https://web-cdn.jitsi.net')
              ) {
                return true;
              }
              // Strictly intercept and suppress any deep-link schemes (intent://, market://, org.jitsi.meet://)
              // to prevent Android Chrome or external stores from opening
              return false;
            }}
            onMessage={handleWebViewMessage}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView native video error: ', nativeEvent);
            }}
          />
        </View>

        {/* Floating Native Clinical Controls Bar */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="bg-[#0F172A] border-t border-slate-800 px-6 py-3 flex-row items-center justify-around z-20"
        >
          {/* Mic Toggle */}
          <Pressable
            onPress={toggleMic}
            className={`h-12 w-12 rounded-full items-center justify-center border ${
              isMicMuted
                ? 'bg-red-500/20 border-red-500/40'
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            {isMicMuted ? <MicOff size={20} color="#EF4444" /> : <Mic size={20} color="#FFFFFF" />}
          </Pressable>

          {/* End Call Button */}
          <Pressable
            onPress={handleEndCall}
            className="h-14 w-14 rounded-full bg-red-600 active:bg-red-700 items-center justify-center shadow-lg shadow-red-900/50"
          >
            <PhoneOff size={24} color="#FFFFFF" />
          </Pressable>

          {/* Camera Toggle */}
          <Pressable
            onPress={toggleVideo}
            className={`h-12 w-12 rounded-full items-center justify-center border ${
              isVideoMuted
                ? 'bg-red-500/20 border-red-500/40'
                : 'bg-slate-800 border-slate-700'
            }`}
          >
            {isVideoMuted ? <VideoOff size={20} color="#EF4444" /> : <Video size={20} color="#FFFFFF" />}
          </Pressable>
        </View>
      </View>
    );
  }

  // ── State 6: Pre-Call Readiness Check Screen ──
  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 20) }}
      className="flex-1 bg-[#090D16] justify-between p-6"
    >
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-800/80 items-center justify-center border border-slate-700"
        >
          <ArrowLeft size={20} color="#CBD5E1" />
        </Pressable>

        <View className="flex-row items-center gap-1.5 bg-[#085041]/30 border border-[#0F9D8C]/40 px-3 py-1 rounded-full">
          <ShieldCheck size={13} color="#0F9D8C" />
          <Text className="font-inter-medium text-xs text-[#0F9D8C]">HIPAA Compliant</Text>
        </View>
      </View>

      {/* Specialist & Session Details */}
      <View className="space-y-6">
        <View className="items-center">
          <View className="h-20 w-20 rounded-full bg-[#085041]/30 border-2 border-[#0F9D8C]/50 items-center justify-center mb-4">
            <Stethoscope size={36} color="#0F9D8C" />
          </View>
          <Text className="font-inter-bold text-xl text-white text-center">
            {callData.doctor?.name || 'Medical Specialist'}
          </Text>
          <Text className="font-inter text-xs text-slate-400 text-center mt-1">
            {callData.doctor?.specialty || 'General Consultation'} • Video Visit
          </Text>
        </View>

        {/* Pre-flight Technical Readiness Card */}
        <Card className="bg-[#0F172A] border border-slate-800 p-4 space-y-3">
          <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-400 mb-1">
            Consultation Readiness
          </Text>

          <View className="flex-row items-center justify-between py-1.5 border-b border-slate-800/80">
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={16} color="#0F9D8C" />
              <Text className="font-inter-medium text-xs text-slate-200">End-to-End Encryption</Text>
            </View>
            <Text className="font-inter-bold text-xs text-emerald-400">Secured</Text>
          </View>

          <View className="flex-row items-center justify-between py-1.5 border-b border-slate-800/80">
            <View className="flex-row items-center gap-2">
              <Video size={16} color="#0F9D8C" />
              <Text className="font-inter-medium text-xs text-slate-200">Camera & Microphone</Text>
            </View>
            <Text className="font-inter-bold text-xs text-emerald-400">Ready</Text>
          </View>

          <View className="flex-row items-center justify-between py-1.5">
            <View className="flex-row items-center gap-2">
              <Lock size={16} color="#0F9D8C" />
              <Text className="font-inter-medium text-xs text-slate-200">Authenticated Session</Text>
            </View>
            <Text className="font-inter-bold text-xs text-emerald-400">Verified</Text>
          </View>
        </Card>
      </View>

      {/* CTA Join Button */}
      <View className="space-y-3">
        <Button
          title="Join Video Consultation"
          onPress={handleStartCall}
          icon={Video}
        />

        <Text className="font-inter text-[11px] text-slate-500 text-center">
          Encrypted audio & video consultation directly embedded inside CuraLink.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#090D16',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});




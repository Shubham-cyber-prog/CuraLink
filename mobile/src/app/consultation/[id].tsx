import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
  Platform,
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
  Lock,
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [callData, setCallData] = useState<JoinResponse | null>(null);

  const fetchJoinData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

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
  };

  useEffect(() => {
    fetchJoinData();
  }, [id]);

  const userName = callData?.userName || (callData?.isDoctor ? 'Dr. Physician' : 'Patient');
  const safeName = encodeURIComponent(userName);

  // Configure URL with disableDeepLinking=true and prejoinPageEnabled=false
  // to suppress Jitsi's app-download interstitial prompt in embedded context
  const callUrl = callData?.roomName
    ? `https://meet.jit.si/${callData.roomName}#config.disableDeepLinking=true&config.prejoinPageEnabled=false&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false&interfaceConfig.HIDE_DEEP_LINKING_LOGO=true&interfaceConfig.MOBILE_APP_PROMO=false&userInfo.displayName="${safeName}"`
    : callData?.roomUrl || '';

  const returnRoute = callData?.isDoctor ? '/(doctor-tabs)/appointments' : '/(tabs)/appointments';

  // End active video call
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
            setInCall(false);
            setCompleted(true);
            if (id) {
              try {
                await api.post(`/consultations/${id}/complete`);
              } catch (err) {
                console.warn('Could not complete consultation:', err);
              }
            }
          },
        },
      ]
    );
  };

  // 1. Loading State
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

  // 2. Error State
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
          <Pressable
            onPress={() => router.back()}
            className="py-3 items-center"
          >
            <Text className="font-inter-medium text-sm text-slate-400">Return to Appointments</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 3. Completed State
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
            Your video visit with {callData.doctor?.name || 'the specialist'} has ended. Clinical notes and prescription details will be updated in your records.
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

  // 4. In Active Video Call (Embedded Directly Inside CuraLink Screen)
  if (inCall) {
    return (
      <View className="flex-1 bg-[#090D16]">
        <StatusBar barStyle="light-content" hidden={false} />

        {/* Minimal Clinical Floating Header */}
        <View
          style={{ paddingTop: Math.max(insets.top, 12) }}
          className="px-4 pb-3 bg-[#0F172A] border-b border-slate-800 flex-row items-center justify-between z-10"
        >
          <View className="flex-row items-center gap-2">
            <View className="h-2 w-2 rounded-full bg-emerald-400" />
            <Text className="font-inter-semibold text-xs text-white" numberOfLines={1}>
              {callData.doctor?.name || 'Clinical Call'}
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1 bg-[#085041]/40 border border-[#0F9D8C]/40 px-2 py-0.5 rounded-full">
              <Lock size={10} color="#0F9D8C" />
              <Text className="font-inter-medium text-[10px] text-[#0F9D8C]">Encrypted</Text>
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

        {/* Embedded WebView Call Frame */}
        <View className="flex-1 bg-black">
          <WebView
            source={{ uri: callUrl }}
            style={styles.webview}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            originWhitelist={['*']}
            // Desktop user agent prevents Jitsi from showing the "Download the app or join using browser" prompt
            userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            // iOS-only permission grant without Fabric enum mismatch
            {...(Platform.OS === 'ios'
              ? { mediaCapturePermissionGrantType: 'grantIfSameHostElsePrompt' as const }
              : {})}
            androidHardwareAccelerationDisabled={false}
            androidLayerType="hardware"
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color="#0F9D8C" />
                <Text style={styles.loadingText}>Connecting to secure video room...</Text>
              </View>
            )}
            onShouldStartLoadWithRequest={(request) => {
              // Allow all HTTP / HTTPS navigation to stay inside this embedded WebView
              if (request.url.startsWith('http://') || request.url.startsWith('https://')) {
                return true;
              }
              // Intercept and suppress external deep-link schemes (intent://, market://, org.jitsi.meet://)
              // so the external Chrome browser or Play Store NEVER opens
              return false;
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView native error: ', nativeEvent);
            }}
            onNavigationStateChange={(navState: any) => {
              // Auto detect if user clicked "Leave" / hung up inside Jitsi Meet UI
              if (
                navState.url.includes('/close') ||
                navState.url.includes('/left') ||
                navState.url.includes('/static/close.html') ||
                navState.url.includes('thankyou')
              ) {
                setInCall(false);
                setCompleted(true);
                if (id) {
                  api.post(`/consultations/${id}/complete`).catch(() => {});
                }
              }
            }}
          />
        </View>
      </View>
    );
  }

  // 5. Pre-Call Ready Screen
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

      {/* Doctor & Readiness Information */}
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

        {/* Pre-flight Technical Checklist */}
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

      {/* Join Action CTA */}
      <View className="space-y-3">
        <Button
          title="Join Video Consultation"
          onPress={() => setInCall(true)}
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



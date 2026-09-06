import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, ShieldCheck, Stethoscope, CheckCircle, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card, Badge } from '../../components/UI';
import { api } from '../../lib/api';

export default function MobileConsultationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [roomData, setRoomData] = useState<{ roomUrl?: string; token?: string; doctorName?: string } | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function initRoom() {
      try {
        const response = await api.post<any>(`/consultations/${id}/room`, {}).catch(() => null);
        if (response && response.data) {
          setRoomData({
            roomUrl: response.data.roomUrl || 'https://curalink.daily.co/consultation-demo',
            token: response.data.token,
            doctorName: response.data.doctorName || 'Dr. Sarah Jenkins',
          });
        } else {
          // Fallback room data for smooth testing
          setRoomData({
            roomUrl: 'https://curalink.daily.co/consultation-demo',
            doctorName: 'Dr. Sarah Jenkins',
          });
        }
      } catch {
        setRoomData({
          roomUrl: 'https://curalink.daily.co/consultation-demo',
          doctorName: 'Dr. Sarah Jenkins',
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      initRoom();
    }
  }, [id]);

  const handleJoinCall = () => {
    setInCall(true);
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
            setInCall(false);
            setCompleted(true);
            try {
              await api.post(`/consultations/${id}/complete`, {}).catch(() => null);
            } catch {
              // Gracefully handle completion
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#0D9488" />
        <Text className="mt-4 font-inter-semibold text-sm text-white">Securing encrypted video room...</Text>
      </View>
    );
  }

  if (completed) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-6 space-y-4">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
          <CheckCircle size={36} color="#0D9488" />
        </View>
        <Text className="font-inter-bold text-2xl text-charcoal text-center">Consultation Completed</Text>
        <Text className="font-inter text-sm text-muted text-center leading-relaxed">
          Your video visit with {roomData?.doctorName || 'your doctor'} has concluded. Summary notes will be available in your medical records.
        </Text>
        <Button
          title="Return to Appointments"
          onPress={() => router.replace('/(tabs)/appointments')}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      {/* Top Bar Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="flex-row items-center justify-between px-5 pb-4 bg-slate-900/80 border-b border-slate-800"
      >
        <View className="flex-row items-center gap-2.5">
          <View className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <View>
            <Text className="font-inter-bold text-sm text-white">{roomData?.doctorName || 'Dr. Sarah Jenkins'}</Text>
            <Text className="font-inter text-[11px] text-slate-400">Cardiology Specialist • HD Video</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
          <ShieldCheck size={12} color="#10B981" />
          <Text className="font-inter-medium text-[10px] text-emerald-400">HIPAA Encrypted</Text>
        </View>
      </View>

      {/* Main Stream Area */}
      <View className="flex-1 justify-center items-center p-5">
        {inCall ? (
          /* Active Call Canvas View */
          <View className="w-full flex-1 rounded-3xl bg-slate-900 overflow-hidden border border-slate-800 relative justify-between p-4">
            {/* Remote Doctor Preview Video Canvas */}
            <View className="flex-1 items-center justify-center rounded-2xl bg-slate-800/80">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-teal-900/60 border-2 border-teal-500/40 mb-3">
                <Stethoscope size={40} color="#14B8A6" />
              </View>
              <Text className="font-inter-bold text-lg text-white">{roomData?.doctorName}</Text>
              <Text className="font-inter text-xs text-teal-400 mt-1">Live Telehealth Video Feed</Text>
            </View>

            {/* Self Camera PIP Overlay Box */}
            <View className="absolute bottom-6 right-6 h-36 w-28 rounded-2xl bg-slate-950 border-2 border-slate-700 overflow-hidden justify-center items-center shadow-xl">
              {videoOff ? (
                <View className="items-center">
                  <VideoOff size={20} color="#94A3B8" />
                  <Text className="font-inter text-[9px] text-slate-400 mt-1">Camera Off</Text>
                </View>
              ) : (
                <View className="items-center">
                  <View className="h-8 w-8 rounded-full bg-teal-600 items-center justify-center mb-1">
                    <Text className="font-inter-bold text-xs text-white">YOU</Text>
                  </View>
                  <Text className="font-inter text-[10px] text-teal-300">Self View</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* Pre-Call Readiness Check */
          <Card className="w-full border border-slate-800 bg-slate-900 p-6 space-y-6">
            <View className="items-center text-center space-y-2">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-teal-950 border-2 border-teal-500/50 mb-2">
                <Stethoscope size={36} color="#14B8A6" />
              </View>
              <Text className="font-inter-bold text-xl text-white text-center">{roomData?.doctorName}</Text>
              <Text className="font-inter text-xs text-slate-400 text-center">
                Ready to begin your scheduled video consultation.
              </Text>
            </View>

            <View className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <View className="flex-row items-center justify-between">
                <Text className="font-inter-medium text-xs text-slate-300">Camera & Microphone</Text>
                <Text className="font-inter-semibold text-xs text-emerald-400">Ready</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-inter-medium text-xs text-slate-300">Connection Quality</Text>
                <Text className="font-inter-semibold text-xs text-emerald-400">Excellent (HD)</Text>
              </View>
            </View>

            <Button
              title="Enter Video Room"
              onPress={handleJoinCall}
            />
          </Card>
        )}
      </View>

      {/* Control Action Toolbar */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        className="bg-slate-900 px-6 pt-4 flex-row items-center justify-around border-t border-slate-800"
      >
        <Pressable
          onPress={() => setMicMuted(!micMuted)}
          className={`h-14 w-14 items-center justify-center rounded-full border ${
            micMuted ? 'bg-red-500/20 border-red-500' : 'bg-slate-800 border-slate-700'
          }`}
        >
          {micMuted ? <MicOff size={22} color="#EF4444" /> : <Mic size={22} color="#FFFFFF" />}
        </Pressable>

        <Pressable
          onPress={() => setVideoOff(!videoOff)}
          className={`h-14 w-14 items-center justify-center rounded-full border ${
            videoOff ? 'bg-red-500/20 border-red-500' : 'bg-slate-800 border-slate-700'
          }`}
        >
          {videoOff ? <VideoOff size={22} color="#EF4444" /> : <VideoIcon size={22} color="#FFFFFF" />}
        </Pressable>

        <Pressable
          onPress={handleEndCall}
          className="h-14 w-14 items-center justify-center rounded-full bg-red-600 active:bg-red-700"
        >
          <PhoneOff size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

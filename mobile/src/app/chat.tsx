import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator } from 'react-native';
import { Send, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../lib/api';

interface MessageItem {
  id: string;
  text: string;
  sender: 'self' | 'other';
  time: string;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { doctorName, doctorId, appointmentId: paramApptId } = useLocalSearchParams<{
    doctorName?: string;
    doctorId?: string;
    appointmentId?: string;
  }>();

  const [activeApptId, setActiveApptId] = useState<string | null>(paramApptId || null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const displayName = doctorName || 'Doctor Consultation';
  const initials = displayName
    .replace('Dr. ', '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DR';

  // 1. Fetch current user and find active appointment if needed
  useEffect(() => {
    async function initChat() {
      try {
        setLoading(true);
        const meRes = await api.get<any>('/auth/me');
        const user = meRes?.data?.user || meRes?.data;
        if (user?.id) {
          setCurrentUserId(user.id);
        }

        if (paramApptId) {
          setActiveApptId(paramApptId);
        } else if (doctorId || user?.id) {
          // Resolve appointment from list of appointments
          const apptsRes = await api.get<any[]>(
            user?.role === 'DOCTOR' ? '/doctor/me/appointments' : '/appointments/my-appointments'
          );
          if (apptsRes?.data && Array.isArray(apptsRes.data) && apptsRes.data.length > 0) {
            const found = doctorId
              ? apptsRes.data.find((a: any) => a.doctorId === doctorId || a.doctor?.userId === doctorId || a.patientId === doctorId)
              : apptsRes.data[0];
            if (found) {
              setActiveApptId(found.id);
            }
          }
        }
      } catch (err) {
        console.warn('Error initializing mobile chat:', err);
      } finally {
        setLoading(false);
      }
    }

    initChat();
  }, [paramApptId, doctorId]);

  // 2. Poll messages from /api/messages?appointmentId=...
  const fetchMessages = useCallback(async () => {
    if (!activeApptId) return;
    try {
      const res = await api.get<any[]>(`/messages?appointmentId=${activeApptId}`);
      if (res?.data && Array.isArray(res.data)) {
        const mapped: MessageItem[] = res.data.map((m: any) => ({
          id: m.id,
          text: m.content,
          sender: m.senderId === currentUserId ? 'self' : 'other',
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setMessages(mapped);
      }
    } catch (err) {
      console.warn('Error polling messages on mobile:', err);
    }
  }, [activeApptId, currentUserId]);

  useEffect(() => {
    if (!activeApptId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeApptId, fetchMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeApptId) return;

    const content = inputText.trim();
    setInputText('');

    try {
      const res = await api.post<any>('/messages', {
        appointmentId: activeApptId,
        content,
      });

      if (res?.data) {
        const newMsg: MessageItem = {
          id: res.data.id,
          text: res.data.content,
          sender: 'self',
          time: new Date(res.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch (err) {
      console.warn('Failed to send message on mobile:', err);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Chat Header */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 16),
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        }}
        className="flex-row items-center bg-white px-4 pb-4"
      >
        <Pressable
          onPress={() => router.back()}
          className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
        >
          <ArrowLeft size={20} color="#334155" />
        </Pressable>
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
          <Text className="font-inter-semibold text-base text-teal-600">{initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-inter-bold text-base text-charcoal">{displayName}</Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <View className="h-2 w-2 rounded-full bg-emerald-500" />
            <Text className="font-inter text-xs text-muted">
              {activeApptId ? 'Encrypted Consultation' : 'Connecting...'}
            </Text>
          </View>
        </View>
      </View>

      {/* Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, flexGrow: 1 }}
        className="flex-1 bg-slate-50"
        showsVerticalScrollIndicator={false}
      >
        {loading && messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="small" color="#0D9488" />
            <Text className="mt-2 font-inter text-xs text-slate-500">Loading conversation...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-16 text-center">
            <Text className="font-inter-medium text-sm text-slate-600">No messages yet</Text>
            <Text className="mt-1 font-inter text-xs text-slate-400 max-w-[240px] text-center">
              Send a secure message to start the consultation conversation.
            </Text>
          </View>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender === 'self';
            return (
              <View
                key={msg.id}
                className={`mb-4 max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  isSelf
                    ? 'self-end rounded-tr-sm bg-teal-600'
                    : 'self-start rounded-tl-sm border border-slate-100 bg-white'
                }`}
              >
                <Text
                  className={`font-inter text-sm leading-relaxed ${
                    isSelf ? 'text-white' : 'text-charcoal'
                  }`}
                >
                  {msg.text}
                </Text>
                <Text
                  className={`mt-1.5 text-right font-inter text-[10px] ${
                    isSelf ? 'text-teal-100' : 'text-muted'
                  }`}
                >
                  {msg.time}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Input Bar */}
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 12),
        }}
        className="flex-row items-center bg-white px-4 py-3 border-t border-slate-100"
      >
        <TextInput
          className="mr-3 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 font-inter text-sm text-charcoal"
          placeholder={activeApptId ? "Type secure message..." : "No active appointment selected"}
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={Boolean(activeApptId)}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || !activeApptId}
          className={`h-11 w-11 items-center justify-center rounded-full active:opacity-90 ${
            inputText.trim() && activeApptId ? 'bg-teal-600' : 'bg-slate-100'
          }`}
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1,
          })}
        >
          <Send size={18} color={inputText.trim() && activeApptId ? '#FFFFFF' : '#94a3b8'} style={{ marginLeft: 2 }} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

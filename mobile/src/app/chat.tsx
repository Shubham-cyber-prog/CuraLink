import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {
  Send,
  ArrowLeft,
  ShieldCheck,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Download,
  CheckCheck,
  Plus,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotionView, MotionPressable } from '../components/Motion';
import { useTheme } from '../lib/theme-context';
import { api } from '../lib/api';
import {
  MedicalAttachment,
  SAMPLE_MEDICAL_ATTACHMENTS,
  formatAttachmentMessage,
  parseMessageContent,
} from '../lib/attachment-picker';

interface MessageItem {
  id: string;
  text: string;
  attachment?: MedicalAttachment;
  sender: 'self' | 'other';
  time: string;
}

interface ConversationSummary {
  appointmentId: string;
  contactName: string;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDark } = useTheme();
  const { doctorName, doctorId, appointmentId: paramApptId } = useLocalSearchParams<{
    doctorName?: string;
    doctorId?: string;
    appointmentId?: string;
  }>();

  const [activeApptId, setActiveApptId] = useState<string | null>(paramApptId || null);
  const [activeContactName, setActiveContactName] = useState<string>(doctorName || 'Consultation Chat');
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<MedicalAttachment | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  const initials =
    activeContactName
      .replace(/^Dr\.?\s*/i, '')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'DR';

  useEffect(() => {
    async function initChat() {
      try {
        setLoading(true);
        const meRes = await api.get<any>('/auth/me');
        const user = meRes?.data?.user || meRes?.data;
        if (user?.id) setCurrentUserId(user.id);

        const convRes = await api.get<any[]>('/messages/conversations').catch(() => null);
        if (Array.isArray(convRes?.data)) {
          const mapped: ConversationSummary[] = convRes.data.map((c: any) => ({
            appointmentId: c.appointmentId || c.id,
            contactName: c.contact?.name || 'Consultation Thread',
          }));
          setConversations(mapped);

          if (!paramApptId && mapped.length > 0) {
            const match = doctorId
              ? convRes.data.find((c: any) => c.contact?.id === doctorId)
              : convRes.data[0];
            if (match) {
              setActiveApptId(match.appointmentId || match.id);
              setActiveContactName(match.contact?.name || doctorName || 'Consultation Chat');
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
  }, [paramApptId, doctorId, doctorName]);

  const fetchMessages = useCallback(async () => {
    if (!activeApptId) return;
    try {
      const res = await api.get<any[]>(`/messages?appointmentId=${activeApptId}`);
      if (res?.data && Array.isArray(res.data)) {
        setMessages(
          res.data.map((m: any) => {
            const parsed = parseMessageContent(m.content);
            return {
              id: m.id,
              text: parsed.text,
              attachment: parsed.attachment,
              sender: m.senderId === currentUserId ? 'self' : 'other',
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
          })
        );
      }
    } catch {
      // Ignore transient polling error
    }
  }, [activeApptId, currentUserId]);

  useEffect(() => {
    if (!activeApptId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3500);
    return () => clearInterval(interval);
  }, [activeApptId, fetchMessages]);

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedAttachment) || !activeApptId) return;
    const textToSend = inputText.trim();
    const attachmentToSend = selectedAttachment;

    setInputText('');
    setSelectedAttachment(null);

    const formattedContent = formatAttachmentMessage(textToSend, attachmentToSend || undefined);

    try {
      const res = await api.post<any>('/messages', {
        appointmentId: activeApptId,
        content: formattedContent,
      });

      if (res?.data) {
        const parsed = parseMessageContent(res.data.content);
        setMessages((prev) => [
          ...prev,
          {
            id: res.data.id,
            text: parsed.text,
            attachment: parsed.attachment,
            sender: 'self',
            time: new Date(res.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.warn('Failed to send message:', err);
      Alert.alert('Delivery Notice', 'Could not send message. Please retry.');
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#F6F8F9] dark:bg-[#06101B]"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Crisp Light Header */}
      <View
        style={{ paddingTop: Math.max(insets.top + 8, 18) }}
        className="bg-white dark:bg-[#0B1F33] px-4 pb-3.5 border-b border-[#E6ECEF] dark:border-[#1B3650]"
      >
        <View className="flex-row items-center">
          <MotionPressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#F4F7F8] dark:bg-[#112942]"
          >
            <ArrowLeft size={19} color={isDark ? '#F3F7F9' : '#0B1F33'} />
          </MotionPressable>
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#EAF4F5] dark:bg-[#112942]">
            <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white" numberOfLines={1}>
              {activeContactName}
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <ShieldCheck size={11} color="#006D77" />
              <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">
                {activeApptId ? 'Full Consultation Chat (Photos & Docs enabled)' : 'No active thread'}
              </Text>
            </View>
          </View>
        </View>

        {conversations.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
            {conversations.map((c) => {
              const active = c.appointmentId === activeApptId;
              return (
                <Pressable
                  key={c.appointmentId}
                  onPress={() => {
                    setActiveApptId(c.appointmentId);
                    setActiveContactName(c.contactName);
                  }}
                  className={`rounded-full px-3.5 py-1.5 border ${
                    active
                      ? 'bg-[#006D77] border-[#006D77]'
                      : 'bg-[#F6F8F9] dark:bg-[#112942] border-[#E6ECEF] dark:border-[#1B3650]'
                  }`}
                >
                  <Text
                    className={`font-inter-semibold text-xs ${
                      active ? 'text-white' : 'text-[#0B1F33] dark:text-slate-200'
                    }`}
                  >
                    {c.contactName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Messages Feed */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="small" color="#006D77" />
          </View>
        ) : messages.length === 0 ? (
          <View className="items-center justify-center py-20 px-6">
            <View className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 items-center justify-center mb-3">
              <FileText size={24} color="#006D77" />
            </View>
            <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white text-center">
              Encrypted Clinical Thread
            </Text>
            <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              Send symptom details, prescriptions, photos, or lab documents directly to {activeContactName}.
            </Text>
          </View>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.sender === 'self';
            const hasAttachment = Boolean(msg.attachment);

            return (
              <MotionView key={msg.id} direction="fade">
                <View
                  className={`mb-3 max-w-[85%] rounded-2xl p-3.5 ${
                    isSelf
                      ? 'self-end rounded-tr-sm bg-[#006D77]'
                      : 'self-start rounded-tl-sm border border-[#E6ECEF] dark:border-[#1B3650] bg-white dark:bg-[#0B1F33]'
                  }`}
                >
                  {/* Photo Attachment Bubble */}
                  {hasAttachment && msg.attachment?.type === 'IMAGE' && (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setPreviewImage(msg.attachment?.url || null)}
                      className="rounded-xl overflow-hidden mb-2 bg-black/10"
                    >
                      <Image
                        source={{ uri: msg.attachment.url }}
                        style={{ width: '100%', height: 180, borderRadius: 12 }}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}

                  {/* Document Attachment Bubble */}
                  {hasAttachment && msg.attachment?.type === 'DOCUMENT' && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        Alert.alert(
                          'Document Preview',
                          `Viewing ${msg.attachment?.name || 'Medical Document'} (${msg.attachment?.size || 'PDF'}).`
                        )
                      }
                      className={`flex-row items-center gap-2.5 p-2.5 rounded-xl mb-2 border ${
                        isSelf
                          ? 'bg-white/15 border-white/20'
                          : 'bg-slate-50 dark:bg-[#112A44] border-slate-200/80 dark:border-slate-700/60'
                      }`}
                    >
                      <View className="h-9 w-9 rounded-lg bg-teal-100 dark:bg-teal-900/60 items-center justify-center">
                        <FileText size={18} color="#006D77" />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-inter-bold text-xs ${isSelf ? 'text-white' : 'text-[#0B1F33] dark:text-white'}`}
                          numberOfLines={1}
                        >
                          {msg.attachment?.name}
                        </Text>
                        <Text className={`font-inter text-[10px] ${isSelf ? 'text-teal-100' : 'text-slate-400'}`}>
                          {msg.attachment?.size || 'PDF Document'}
                        </Text>
                      </View>
                      <Download size={14} color={isSelf ? '#FFFFFF' : '#006D77'} />
                    </TouchableOpacity>
                  )}

                  {/* Text Message */}
                  {Boolean(msg.text) && (
                    <Text className={`font-inter text-sm leading-relaxed ${isSelf ? 'text-white' : 'text-[#0B1F33] dark:text-white'}`}>
                      {msg.text}
                    </Text>
                  )}

                  {/* Timestamp */}
                  <View className="mt-1 flex-row items-center justify-end gap-1">
                    <Text className={`font-inter text-[10px] ${isSelf ? 'text-white/75' : 'text-slate-400'}`}>
                      {msg.time}
                    </Text>
                    {isSelf && <CheckCheck size={11} color="#FFFFFF" />}
                  </View>
                </View>
              </MotionView>
            );
          })
        )}
      </ScrollView>

      {/* Selected Attachment Preview Bar (Before Sending) */}
      {selectedAttachment && (
        <View className="bg-teal-50 dark:bg-[#112A44] px-4 py-2 border-t border-teal-200 dark:border-teal-800 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1 pr-2">
            {selectedAttachment.type === 'IMAGE' ? (
              <Image
                source={{ uri: selectedAttachment.url }}
                style={{ width: 34, height: 34, borderRadius: 6 }}
              />
            ) : (
              <View className="h-8 w-8 rounded-lg bg-[#006D77] items-center justify-center">
                <FileText size={16} color="#FFFFFF" />
              </View>
            )}
            <View className="flex-1">
              <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]" numberOfLines={1}>
                {selectedAttachment.name}
              </Text>
              <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400">
                {selectedAttachment.type === 'IMAGE' ? 'Medical Photo' : 'PDF Document'} · {selectedAttachment.size}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setSelectedAttachment(null)}
            className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center"
          >
            <X size={12} color="#0B1F33" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Action Bar */}
      <View
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        className="flex-row items-center bg-white dark:bg-[#0B1F33] px-3 py-2.5 border-t border-[#E6ECEF] dark:border-[#1B3650] gap-2"
      >
        {/* Attachment Options Button */}
        <TouchableOpacity
          onPress={() => setShowAttachModal(true)}
          className="h-10 w-10 rounded-full bg-[#F6F8F9] dark:bg-[#112A44] items-center justify-center border border-slate-200 dark:border-slate-700"
          title="Attach Photo or Document"
        >
          <Paperclip size={18} color={isDark ? '#83C5BE' : '#006D77'} />
        </TouchableOpacity>

        {/* Text Input Field */}
        <TextInput
          className="flex-1 rounded-full border border-[#E6ECEF] dark:border-[#1B3650] bg-[#F6F8F9] dark:bg-[#06101B] px-4 py-2 font-inter text-sm text-[#0B1F33] dark:text-white"
          placeholder={activeApptId ? 'Type message or attach report...' : 'Select active appointment to chat'}
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={800}
          editable={Boolean(activeApptId)}
        />

        {/* Send Button */}
        <MotionPressable
          onPress={handleSend}
          disabled={(!inputText.trim() && !selectedAttachment) || !activeApptId}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            (inputText.trim() || selectedAttachment) && activeApptId
              ? 'bg-[#006D77]'
              : 'bg-slate-200 dark:bg-[#112942]'
          }`}
        >
          <Send
            size={16}
            color={(inputText.trim() || selectedAttachment) && activeApptId ? '#FFFFFF' : isDark ? '#64748B' : '#94A3B8'}
            style={{ marginLeft: 2 }}
          />
        </MotionPressable>
      </View>

      {/* Attachment Options Bottom Modal */}
      <Modal
        visible={showAttachModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachModal(false)}
      >
        <Pressable
          onPress={() => setShowAttachModal(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ paddingBottom: Math.max(insets.bottom + 12, 24) }}
            className="bg-white dark:bg-[#0B1F33] rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 space-y-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                Attach Medical Files
              </Text>
              <TouchableOpacity onPress={() => setShowAttachModal(false)}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
              Select medical reports, lab PDF test files, or physical prescription scans to share with {activeContactName}.
            </Text>

            <View className="space-y-2.5">
              {SAMPLE_MEDICAL_ATTACHMENTS.map((sample, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setSelectedAttachment(sample);
                    setShowAttachModal(false);
                  }}
                  className="flex-row items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112A44] border border-slate-200/80 dark:border-slate-700/60"
                >
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 items-center justify-center">
                      {sample.type === 'IMAGE' ? (
                        <ImageIcon size={18} color="#006D77" />
                      ) : (
                        <FileText size={18} color="#006D77" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white" numberOfLines={1}>
                        {sample.name}
                      </Text>
                      <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400">
                        {sample.type === 'IMAGE' ? 'Clinical Photo Scan' : 'PDF Medical Report'} · {sample.size}
                      </Text>
                    </View>
                  </View>
                  <View className="px-2.5 py-1 rounded-full bg-[#006D77]">
                    <Text className="font-inter-bold text-[10px] text-white">Attach</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Full-Screen Image Preview Modal */}
      <Modal
        visible={Boolean(previewImage)}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View className="flex-1 bg-black/95 justify-center items-center p-4">
          <TouchableOpacity
            onPress={() => setPreviewImage(null)}
            className="absolute top-12 right-6 z-20 h-10 w-10 rounded-full bg-white/20 items-center justify-center"
          >
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image
              source={{ uri: previewImage }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

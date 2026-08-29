import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_MESSAGES = [
  { id: '1', text: 'Hello, how can I help you today?', sender: 'doctor', time: '10:00 AM' },
  { id: '2', text: 'I have been experiencing a mild headache since yesterday.', sender: 'patient', time: '10:02 AM' },
  { id: '3', text: 'I see. Are there any other symptoms like fever or nausea?', sender: 'doctor', time: '10:03 AM' },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'patient',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
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
        className="flex-row items-center bg-white px-5 pb-4"
      >
        <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
          <Text className="font-inter-semibold text-base text-teal-600">SJ</Text>
        </View>
        <View className="flex-1">
          <Text className="font-inter-bold text-base text-charcoal">Dr. Sarah Jenkins</Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <View className="h-2 w-2 rounded-full bg-emerald-500" />
            <Text className="font-inter text-xs text-muted">Online</Text>
          </View>
        </View>
      </View>

      {/* Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        className="flex-1 bg-slate-50"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isPatient = msg.sender === 'patient';
          return (
            <View
              key={msg.id}
              className={`mb-4 max-w-[80%] rounded-2xl p-4 shadow-sm ${
                isPatient
                  ? 'self-end rounded-tr-sm bg-teal-600'
                  : 'self-start rounded-tl-sm border border-slate-100 bg-white'
              }`}
            >
              <Text
                className={`font-inter text-sm leading-relaxed ${
                  isPatient ? 'text-white' : 'text-charcoal'
                }`}
              >
                {msg.text}
              </Text>
              <Text
                className={`mt-1.5 text-right font-inter text-[10px] ${
                  isPatient ? 'text-teal-100' : 'text-muted'
                }`}
              >
                {msg.time}
              </Text>
            </View>
          );
        })}
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
          placeholder="Type secure message..."
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim()}
          className={`h-11 w-11 items-center justify-center rounded-full active:opacity-90 ${
            inputText.trim() ? 'bg-teal-600' : 'bg-slate-100'
          }`}
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1
          })}
        >
          <Send size={18} color={inputText.trim() ? '#FFFFFF' : '#94a3b8'} style={{ marginLeft: 2 }} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

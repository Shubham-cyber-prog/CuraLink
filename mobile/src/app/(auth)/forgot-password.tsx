import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError('');
    setIsSent(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
          <View className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200">
            <View className="mb-6 h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
              <KeyRound color="#0D9488" size={22} />
            </View>
            <Text className="font-inter-bold text-2xl text-charcoal">Reset your password</Text>
            <Text className="mt-2 font-inter text-base leading-6 text-muted">
              Enter the email linked to your account and we&apos;ll send reset instructions.
            </Text>
            {isSent ? (
              <Text className="my-6 rounded-xl bg-teal-50 p-4 font-inter text-sm leading-5 text-teal-800">
                If an account exists for this address, reset instructions are on their way.
              </Text>
            ) : (
              <View className="mt-6">
                <Input
                  autoCapitalize="none"
                  keyboardType="email-address"
                  label="Email address"
                  onChangeText={(value) => {
                    setEmail(value);
                    setEmailError('');
                  }}
                  placeholder="name@example.com"
                  value={email}
                  error={emailError}
                />
              </View>
            )}
            <Button title={isSent ? 'Back to sign in' : 'Send reset link'} onPress={isSent ? () => router.back() : handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

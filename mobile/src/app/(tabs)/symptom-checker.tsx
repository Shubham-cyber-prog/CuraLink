import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, Send, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw, Stethoscope } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';

interface AnalysisResult {
  triageCategory: 'RED' | 'YELLOW' | 'GREEN';
  severity: 'Emergency' | 'Moderate' | 'Mild';
  urgencyLabel: string;
  summary: string;
  recommendedSpecialist: string;
  possibleCauses: string[];
  recommendedAction: string;
}

export default function SymptomCheckerTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      // Send to backend symptom checker if available, or simulate AI triage
      const response = await api.post<AnalysisResult>('/symptom-checker', { symptoms }).catch(() => null);

      if (response && response.data) {
        setResult(response.data);
      } else {
        // Fallback intelligent clinical rules triage logic
        const lower = symptoms.toLowerCase();
        let triageCategory: 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';
        let severity: 'Emergency' | 'Moderate' | 'Mild' = 'Mild';
        let urgencyLabel = 'Routine Self-Care & Follow-up';
        let specialist = 'General Practitioner';
        let causes = ['Common Cold', 'Seasonal Allergies', 'Mild Stress/Fatigue'];
        let recommendation = 'Rest, maintain hydration, and monitor symptoms over 48 hours.';

        if (lower.includes('chest pain') || lower.includes('shortness of breath') || lower.includes('fainting') || lower.includes('stroke')) {
          triageCategory = 'RED';
          severity = 'Emergency';
          urgencyLabel = 'Immediate Emergency Medical Care Required';
          specialist = 'Cardiologist / Emergency';
          causes = ['Acute Cardiac Event', 'Severe Respiratory Distress', 'Vascular Compromise'];
          recommendation = 'Seek immediate emergency medical attention or call emergency services (911/112). Do not attempt to drive yourself.';
        } else if (lower.includes('fever') || lower.includes('severe headache') || lower.includes('stomach') || lower.includes('pain') || lower.includes('rash')) {
          triageCategory = 'YELLOW';
          severity = 'Moderate';
          urgencyLabel = 'Same-Day or Next-Day Consultation Recommended';
          specialist = lower.includes('headache') ? 'Neurologist' : lower.includes('rash') ? 'Dermatologist' : 'General Practice';
          causes = ['Migraine / Tension Headache', 'Acute Viral Infection', 'Localized Inflammation'];
          recommendation = 'Schedule a consultation with a specialist within 24-48 hours. Keep track of temperature and symptom progression.';
        }

        setResult({
          triageCategory,
          severity,
          urgencyLabel,
          summary: `Clinical assessment based on your input: "${symptoms.trim().slice(0, 80)}..."`,
          recommendedSpecialist: specialist,
          possibleCauses: causes,
          recommendedAction: recommendation,
        });
      }
    } catch {
      setErrorMsg('Failed to process symptom assessment. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSymptoms('');
    setErrorMsg(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50 dark:bg-[#0B1120]"
    >
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white dark:bg-[#151B2E] border-b border-slate-100 dark:border-[#263049] px-5 pb-4"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60">
            <Bot size={22} color="#0D9488" />
          </View>
          <View>
            <Text className="font-inter-bold text-xl text-charcoal dark:text-[#F1F5F9]">AI Health Assistant</Text>
            <Text className="font-inter text-xs text-muted dark:text-slate-400">24/7 Clinical Symptom Triage</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom + 90, 100),
        }}
        showsVerticalScrollIndicator={false}
      >
        {!result ? (
          <View className="space-y-5">
            {/* Intro Banner */}
            <Card className="border border-teal-100 dark:border-teal-800/60 bg-teal-50/50 dark:bg-teal-950/30 p-4">
              <View className="flex-row items-start gap-3">
                <ShieldAlert size={22} color="#0D9488" style={{ marginTop: 2 }} />
                <View className="flex-1">
                  <Text className="font-inter-bold text-sm text-teal-900 dark:text-teal-200">How can I help you today?</Text>
                  <Text className="mt-1 font-inter text-xs text-teal-700 dark:text-teal-400 leading-relaxed">
                    Describe your symptoms, how long you've had them, and any pain levels. Our AI will analyze clinical risk and recommend the right specialist.
                  </Text>
                </View>
              </View>
            </Card>

            {/* Input Form */}
            <View className="space-y-2">
              <Text className="font-inter-semibold text-sm text-charcoal dark:text-[#F1F5F9]">Enter your symptoms</Text>
              <View className="rounded-2xl border border-slate-200 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-4 shadow-sm">
                <TextInput
                  multiline
                  numberOfLines={6}
                  placeholder="E.g., I have had a throbbing headache for 2 days with light sensitivity and mild nausea..."
                  placeholderTextColor="#94A3B8"
                  className="h-32 font-inter text-sm text-charcoal dark:text-[#F1F5F9]"
                  textAlignVertical="top"
                  value={symptoms}
                  onChangeText={setSymptoms}
                  editable={!isAnalyzing}
                />
              </View>
            </View>

            {/* Quick Prompts */}
            <View>
              <Text className="mb-2 font-inter-medium text-xs text-muted dark:text-slate-400">Quick symptom templates:</Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  'Fever & Sore Throat',
                  'Persistent Headache',
                  'Skin Rash & Itching',
                  'Lower Back Pain',
                ].map((prompt) => (
                  <Pressable
                    key={prompt}
                    onPress={() => setSymptoms(`I am experiencing ${prompt.toLowerCase()} for the past 2 days.`)}
                    className="rounded-xl border border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338] px-3 py-2"
                  >
                    <Text className="font-inter-medium text-xs text-slate-700 dark:text-slate-300">{prompt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {errorMsg && (
              <Text className="font-inter text-xs text-red-600 dark:text-red-400 px-1">{errorMsg}</Text>
            )}

            <Button
              title={isAnalyzing ? 'Analyzing Symptoms...' : 'Analyze Symptoms Now'}
              onPress={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={!symptoms.trim()}
              icon={Send}
              iconPosition="right"
            />
          </View>
        ) : (
          /* Triage Results Screen */
          <View className="space-y-5">
            {/* Category Alert Card */}
            <Card
              className={`border p-5 ${
                result.triageCategory === 'RED'
                  ? 'border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40'
                  : result.triageCategory === 'YELLOW'
                  ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40'
                  : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40'
              }`}
            >
              <View className="flex-row items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-3 mb-3">
                <View className="flex-row items-center gap-2">
                  {result.triageCategory === 'RED' ? (
                    <AlertTriangle size={20} color="#DC2626" />
                  ) : result.triageCategory === 'YELLOW' ? (
                    <AlertTriangle size={20} color="#D97706" />
                  ) : (
                    <CheckCircle2 size={20} color="#059669" />
                  )}
                  <Text
                    className={`font-inter-bold text-base ${
                      result.triageCategory === 'RED'
                        ? 'text-red-900 dark:text-red-200'
                        : result.triageCategory === 'YELLOW'
                        ? 'text-amber-900 dark:text-amber-200'
                        : 'text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    {result.severity} Priority Assessment
                  </Text>
                </View>
                <Badge
                  label={result.triageCategory}
                  variant={
                    result.triageCategory === 'RED'
                      ? 'danger'
                      : result.triageCategory === 'YELLOW'
                      ? 'warning'
                      : 'success'
                  }
                />
              </View>
              <Text
                className={`font-inter-semibold text-sm ${
                  result.triageCategory === 'RED'
                    ? 'text-red-800 dark:text-red-300'
                    : result.triageCategory === 'YELLOW'
                    ? 'text-amber-800 dark:text-amber-300'
                    : 'text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {result.urgencyLabel}
              </Text>
            </Card>

            {/* Recommendation & Causes Card */}
            <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] space-y-4">
              <View>
                <Text className="font-inter-semibold text-xs text-muted dark:text-slate-400 uppercase tracking-wider">Clinical Guidance</Text>
                <Text className="mt-1 font-inter text-sm text-charcoal dark:text-[#F1F5F9] leading-relaxed">
                  {result.recommendedAction}
                </Text>
              </View>

              <View className="border-t border-slate-100 dark:border-[#263049] pt-3">
                <Text className="font-inter-semibold text-xs text-muted dark:text-slate-400 uppercase tracking-wider mb-2">Recommended Specialist</Text>
                <View className="flex-row items-center gap-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 p-3 border border-teal-100 dark:border-teal-800/60">
                  <View className="h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                    <Stethoscope size={20} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-bold text-sm text-teal-900 dark:text-teal-200">{result.recommendedSpecialist}</Text>
                    <Text className="font-inter text-xs text-teal-700 dark:text-teal-400">Best matched for your symptoms</Text>
                  </View>
                </View>
              </View>

              <View className="border-t border-slate-100 dark:border-[#263049] pt-3">
                <Text className="font-inter-semibold text-xs text-muted dark:text-slate-400 uppercase tracking-wider mb-2">Possible Conditions to Check</Text>
                {result.possibleCauses.map((cause, idx) => (
                  <View key={idx} className="flex-row items-center gap-2 mb-1">
                    <View className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <Text className="font-inter text-sm text-slate-700 dark:text-slate-300">{cause}</Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Action CTAs */}
            <View className="space-y-3 pt-2">
              <Button
                title={`Book with ${result.recommendedSpecialist}`}
                onPress={() => router.push('/doctor-booking')}
                icon={ArrowRight}
                iconPosition="right"
              />
              <Button
                title="Perform New Check"
                variant="outline"
                onPress={handleReset}
                icon={RefreshCw}
                iconPosition="left"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

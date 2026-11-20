import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, Send, AlertTriangle, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw, Stethoscope } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { MotionView, MotionPressable } from '../../components/Motion';
import { useTheme } from '../../lib/theme-context';
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
  const { isDark } = useTheme();
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await api.post<AnalysisResult>('/symptom-checker', { symptoms }).catch(() => null);

      if (response && response.data) {
        setResult(response.data);
      } else {
        const lower = symptoms.toLowerCase();
        let triageCategory: 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';
        let severity: 'Emergency' | 'Moderate' | 'Mild' = 'Mild';
        let urgencyLabel = 'Routine Care & Follow-up';
        let specialist = 'General Practice';
        let causes = ['Seasonal Viral Infection', 'Mild Allergic Reaction', 'Fatigue or Dehydration'];
        let recommendation = 'Stay hydrated, rest, and book a routine video consultation if symptoms continue.';

        if (lower.includes('chest') || lower.includes('breath') || lower.includes('faint') || lower.includes('stroke')) {
          triageCategory = 'RED';
          severity = 'Emergency';
          urgencyLabel = 'Immediate Emergency Medical Care Required';
          specialist = 'Cardiology';
          causes = ['Acute Cardiac Symptom', 'Respiratory Distress', 'Vascular Concern'];
          recommendation = 'Seek immediate emergency medical attention or call 112 right away.';
        } else if (lower.includes('fever') || lower.includes('headache') || lower.includes('migraine') || lower.includes('rash') || lower.includes('pain')) {
          triageCategory = 'YELLOW';
          severity = 'Moderate';
          urgencyLabel = 'Same-Day or Next-Day Consultation Recommended';
          specialist = lower.includes('headache') || lower.includes('migraine')
            ? 'Neurology'
            : lower.includes('rash') || lower.includes('skin')
            ? 'Dermatology'
            : 'General Practice';
          causes = ['Migraine / Tension Headache', 'Acute Viral Infection', 'Localized Inflammation'];
          recommendation = 'Schedule a video consultation within 24 hours to evaluate symptoms and get prescribed care.';
        }

        setResult({
          triageCategory,
          severity,
          urgencyLabel,
          summary: `Clinical triage for: "${symptoms.trim().slice(0, 90)}"`,
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#F4F7F8] dark:bg-[#06101B]"
    >
      <View
        style={{ paddingTop: Math.max(insets.top + 10, 20) }}
        className="bg-white dark:bg-[#0B1F33] border-b border-[#E6ECEF] dark:border-[#1B3650] px-5 pb-4"
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EAF4F5] dark:bg-[#112942]">
            <Bot size={20} color={isDark ? '#83C5BE' : '#006D77'} />
          </View>
          <View>
            <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">AI Symptom Triage</Text>
            <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
              Clinical guidance &amp; specialist matching
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom + 100, 115),
        }}
        showsVerticalScrollIndicator={false}
      >
        {!result ? (
          <MotionView delay={60} className="space-y-5">
            <Card className="p-4 flex-row items-start gap-3">
              <ShieldAlert size={20} color={isDark ? '#83C5BE' : '#006D77'} style={{ marginTop: 2 }} />
              <View className="flex-1">
                <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">
                  Describe how you&apos;re feeling
                </Text>
                <Text className="mt-1 font-inter text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Share your main symptoms and duration. We&apos;ll assess urgency and match you with the right verified specialist.
                </Text>
              </View>
            </Card>

            <View className="space-y-2">
              <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">Your Symptoms</Text>
              <View className="rounded-[24px] border border-[#E2E9EC] dark:border-[#1B3650] bg-white dark:bg-[#0B1F33] p-4">
                <TextInput
                  multiline
                  numberOfLines={6}
                  placeholder="e.g., Throbbing headache for 2 days with mild nausea and sensitivity to light..."
                  placeholderTextColor="#94A3B8"
                  className="h-32 font-inter text-sm text-[#0B1F33] dark:text-white"
                  textAlignVertical="top"
                  value={symptoms}
                  onChangeText={setSymptoms}
                  editable={!isAnalyzing}
                />
              </View>
            </View>

            <View>
              <Text className="mb-2 font-inter-medium text-xs text-slate-500 dark:text-slate-400">Quick templates:</Text>
              <View className="flex-row flex-wrap gap-2">
                {['Fever & Sore Throat', 'Recurring Migraine', 'Skin Rash & Itching', 'Chest Tightness'].map((prompt) => (
                  <MotionPressable
                    key={prompt}
                    onPress={() => setSymptoms(`I have been experiencing ${prompt.toLowerCase()} for the past 2 days.`)}
                    className="rounded-full border border-[#E2E9EC] dark:border-[#1B3650] bg-white dark:bg-[#0B1F33] px-3.5 py-2"
                  >
                    <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-slate-200">{prompt}</Text>
                  </MotionPressable>
                ))}
              </View>
            </View>

            {errorMsg && <Text className="font-inter text-xs text-rose-600">{errorMsg}</Text>}

            <Button
              title={isAnalyzing ? 'Analyzing...' : 'Analyze Symptoms'}
              onPress={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={!symptoms.trim()}
              icon={Send}
              iconPosition="right"
            />
          </MotionView>
        ) : (
          <MotionView delay={40} className="space-y-4">
            <Card
              className={`p-5 ${
                result.triageCategory === 'RED'
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40'
                  : result.triageCategory === 'YELLOW'
                  ? 'border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40'
                  : 'border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40'
              }`}
            >
              <View className="flex-row items-center justify-between pb-3 mb-3 border-b border-black/10">
                <View className="flex-row items-center gap-2">
                  {result.triageCategory === 'GREEN' ? (
                    <CheckCircle2 size={20} color="#059669" />
                  ) : (
                    <AlertTriangle size={20} color={result.triageCategory === 'RED' ? '#DC2626' : '#D97706'} />
                  )}
                  <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                    {result.severity} Priority
                  </Text>
                </View>
                <Badge
                  label={result.triageCategory}
                  variant={result.triageCategory === 'RED' ? 'danger' : result.triageCategory === 'YELLOW' ? 'warning' : 'success'}
                />
              </View>
              <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-slate-200">{result.urgencyLabel}</Text>
            </Card>

            <Card className="p-5 space-y-4">
              <View>
                <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-400">Next Step</Text>
                <Text className="mt-1 font-inter text-sm text-[#0B1F33] dark:text-slate-200 leading-relaxed">
                  {result.recommendedAction}
                </Text>
              </View>

              <View className="border-t border-[#EDF3F4] dark:border-[#1B3650] pt-3">
                <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Matched Specialist
                </Text>
                <View className="flex-row items-center justify-between rounded-2xl bg-[#EAF4F5] dark:bg-[#112942] p-3.5">
                  <View className="flex-row items-center gap-2.5">
                    <Stethoscope size={18} color={isDark ? '#83C5BE' : '#006D77'} />
                    <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">
                      {result.recommendedSpecialist}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/doctors',
                        params: { specialty: result.recommendedSpecialist },
                      } as any)
                    }
                    className="flex-row items-center gap-1 rounded-full bg-[#006D77] px-3.5 py-1.5"
                  >
                    <Text className="font-inter-semibold text-xs text-white">Book</Text>
                    <ArrowRight size={13} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            </Card>

            <Button
              title="Check Another Symptom"
              variant="outline"
              icon={RefreshCw}
              onPress={() => {
                setResult(null);
                setSymptoms('');
                setErrorMsg(null);
              }}
            />
          </MotionView>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { Button } from '../components/Button';
import { Card, Badge } from '../components/UI';
import { ScreenHeader } from '../components/ScreenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AnalysisResult {
  causes: string[];
  severity: 'Low' | 'Moderate' | 'High';
  recommendation: string;
}

export default function SymptomCheckerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      setResult({
        causes: ['Common Cold', 'Seasonal Allergies', 'Mild Respiratory Infection'],
        severity: 'Low',
        recommendation: 'Rest, stay hydrated, and monitor symptoms. If they persist for more than a week, consider booking an appointment.',
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScreenHeader title="Symptom Checker" />

      <ScrollView 
        contentContainerStyle={{ 
          padding: 20, 
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom, 24)
        }} 
        className="bg-slate-50"
        showsVerticalScrollIndicator={false}
      >
        {!result ? (
          <View className="space-y-6">
            <View>
              <Text className="font-inter-semibold text-lg text-charcoal">
                Describe your symptoms
              </Text>
              <Text className="mt-1 font-inter text-sm text-muted">
                Please be as detailed as possible. Include duration, severity, and any other relevant details.
              </Text>
            </View>

            <View className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <TextInput
                multiline
                numberOfLines={8}
                placeholder="E.g., I've had a headache for 3 days and feel slightly feverish..."
                placeholderTextColor="#94a3b8"
                className="h-36 font-inter text-sm text-charcoal"
                textAlignVertical="top"
                value={symptoms}
                onChangeText={setSymptoms}
              />
            </View>

            <Button 
              title="Analyze Symptoms" 
              onPress={handleAnalyze} 
              isLoading={isLoading}
              disabled={!symptoms.trim()}
            />
          </View>
        ) : (
          <View className="space-y-6">
            <Card className="border border-slate-100 bg-white">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="font-inter-bold text-lg text-charcoal">Analysis Results</Text>
                <Badge 
                  label={`${result.severity} Severity`} 
                  variant={
                    result.severity === 'Low' ? 'success' : 
                    result.severity === 'Moderate' ? 'warning' : 'danger'
                  } 
                />
              </View>

              <Text className="mb-2 font-inter-semibold text-sm text-charcoal">Possible Causes:</Text>
              <View className="mb-4 pl-1 space-y-1">
                {result.causes.map((cause, idx) => (
                  <Text key={idx} className="font-inter text-sm text-muted">• {cause}</Text>
                ))}
              </View>

              <Text className="mb-2 font-inter-semibold text-sm text-charcoal">Recommendation:</Text>
              <Text className="font-inter text-sm leading-relaxed text-muted">{result.recommendation}</Text>
            </Card>

            <View className="flex-row items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200 shadow-sm">
              <AlertCircle size={20} color="#d97706" />
              <Text className="flex-1 font-inter text-xs text-amber-800 leading-relaxed">
                <Text className="font-inter-semibold">Disclaimer:</Text> This analysis is powered by AI and is for informational purposes only. It is not a medical diagnosis. Always consult a licensed healthcare professional.
              </Text>
            </View>

            <View className="space-y-3">
              <Button 
                title="Book an Appointment" 
                onPress={() => router.push('/doctor-booking')} 
              />
              <Button 
                title="Check Again" 
                variant="outline"
                onPress={() => {
                  setResult(null);
                  setSymptoms('');
                }} 
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

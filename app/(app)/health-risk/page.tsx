"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Heart,
  Droplets,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Sparkles,
  BarChart3,
  RefreshCw,
} from "lucide-react";

interface FeatureContribution {
  feature: string;
  displayName: string;
  rawValue: number;
  contribution: number;
  direction: "increases_risk" | "protective";
}

interface RiskResult {
  riskScore: number;
  riskPercentage: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendation: string;
  featureImportance: FeatureContribution[];
  disclaimer: string;
}

export default function HealthRiskPage() {
  const [activeTab, setActiveTab] = useState<"diabetes" | "heart">("diabetes");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Diabetes Form State (pre-filled with clinical test values)
  const [diabetesForm, setDiabetesForm] = useState({
    pregnancies: 2,
    glucose: 140,
    bloodPressure: 80,
    skinThickness: 25,
    insulin: 100,
    bmi: 32,
    diabetesPedigreeFunction: 0.5,
    age: 45,
  });

  // Heart Form State (pre-filled with clinical test values featuring ca & thal)
  const [heartForm, setHeartForm] = useState({
    age: 58,
    sex: 1,
    cp: 1,
    trestbps: 135,
    chol: 245,
    fbs: 0,
    restecg: 0,
    thalach: 140,
    exang: 1,
    oldpeak: 1.5,
    slope: 1,
    ca: 1,
    thal: 2,
  });

  const handleDiabetesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "diabetes", data: diabetesForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to calculate diabetes risk");
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Error running risk model");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/health-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "heart", data: heartForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to calculate cardiovascular risk");
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Error running risk model");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return {
          bg: "bg-red-50 dark:bg-red-950/40",
          border: "border-red-300 dark:border-red-800",
          text: "text-red-700 dark:text-red-300",
          badge: "bg-red-600 text-white",
          bar: "bg-red-500",
          icon: AlertCircle,
        };
      case "MEDIUM":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40",
          border: "border-amber-300 dark:border-amber-800",
          text: "text-amber-800 dark:text-amber-300",
          badge: "bg-amber-600 text-white",
          bar: "bg-amber-500",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-teal-50 dark:bg-teal-950/40",
          border: "border-teal-300 dark:border-teal-800",
          text: "text-teal-800 dark:text-teal-300",
          badge: "bg-teal-600 text-white",
          bar: "bg-teal-500",
          icon: CheckCircle2,
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B101B] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-[#0F766E] to-cyan-900 p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider backdrop-blur-md mb-4">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" />
              Machine Learning Clinical Assessment
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              AI-Powered Health Risk Assessment
            </h1>
            <p className="mt-2 text-teal-100 text-sm sm:text-base leading-relaxed">
              Predictive models trained on validated clinical datasets (PIMA Diabetes & UCI Cleveland Heart Disease) with feature importance explainability.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl max-w-md mx-auto shadow-inner">
          <button
            onClick={() => {
              setActiveTab("diabetes");
              setResult(null);
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "diabetes"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Droplets className="h-4 w-4" />
            Type 2 Diabetes Risk
          </button>
          <button
            onClick={() => {
              setActiveTab("heart");
              setResult(null);
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "heart"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Heart className="h-4 w-4" />
            Cardiovascular Heart Risk
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div
                className={`p-2.5 rounded-xl ${
                  activeTab === "diabetes"
                    ? "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400"
                    : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                }`}
              >
                {activeTab === "diabetes" ? (
                  <Droplets className="h-6 w-6" />
                ) : (
                  <Heart className="h-6 w-6" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeTab === "diabetes"
                    ? "Diabetes Metabolic Biomarkers"
                    : "Cardiovascular Health Profile"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in your clinical numbers to estimate risk
                </p>
              </div>
            </div>

            {/* Diabetes Form */}
            {activeTab === "diabetes" && (
              <form onSubmit={handleDiabetesSubmit} className="space-y-4 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fasting Glucose (mg/dL)
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="300"
                      value={diabetesForm.glucose}
                      onChange={(e) =>
                        setDiabetesForm({
                          ...diabetesForm,
                          glucose: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400">Normal: 70–99 mg/dL</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Body Mass Index (BMI)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="10"
                      max="60"
                      value={diabetesForm.bmi}
                      onChange={(e) =>
                        setDiabetesForm({
                          ...diabetesForm,
                          bmi: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400">Normal: 18.5–24.9</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Patient Age (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="110"
                      value={diabetesForm.age}
                      onChange={(e) =>
                        setDiabetesForm({
                          ...diabetesForm,
                          age: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Diastolic BP (mm Hg)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="150"
                      value={diabetesForm.bloodPressure}
                      onChange={(e) =>
                        setDiabetesForm({
                          ...diabetesForm,
                          bloodPressure: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Normal: &lt;80 mm Hg</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Skin Fold Thickness (mm)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="99"
                      value={diabetesForm.skinThickness}
                      onChange={(e) =>
                        setDiabetesForm({
                          ...diabetesForm,
                          skinThickness: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Triceps fold (avg ~20 mm)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Serum Insulin (mu U/ml)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={diabetesForm.insulin}
                      onChange={(e) =>
                        setDiabetesForm({
                          ...diabetesForm,
                          insulin: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Normal: 16–166 mu U/ml</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Diabetes Pedigree Function
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="2.5"
                      value={diabetesForm.diabetesPedigreeFunction}
                      onChange={(e) =>
                        setDiabetesForm({
                          ...diabetesForm,
                          diabetesPedigreeFunction: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Family genetic score (0.1–2.0)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Pregnancies (If female)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={diabetesForm.pregnancies}
                      onChange={(e) =>
                        setDiabetesForm({
                          ...diabetesForm,
                          pregnancies: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Evaluating Biomarkers...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4" />
                      Calculate Diabetes Risk Score
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Heart Form */}
            {activeTab === "heart" && (
              <form onSubmit={handleHeartSubmit} className="space-y-4 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Patient Age (Years)
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={heartForm.age}
                      onChange={(e) =>
                        setHeartForm({
                          ...heartForm,
                          age: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Biological Sex
                    </label>
                    <select
                      value={heartForm.sex}
                      onChange={(e) =>
                        setHeartForm({ ...heartForm, sex: parseInt(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value={1}>Male</option>
                      <option value={0}>Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Chest Pain Type (cp)
                    </label>
                    <select
                      value={heartForm.cp}
                      onChange={(e) =>
                        setHeartForm({ ...heartForm, cp: parseInt(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value={0}>Typical Angina (0)</option>
                      <option value={1}>Atypical Angina (1)</option>
                      <option value={2}>Non-Anginal Pain (2)</option>
                      <option value={3}>Asymptomatic (3)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Resting Blood Pressure (mm Hg)
                    </label>
                    <input
                      type="number"
                      min="80"
                      max="220"
                      value={heartForm.trestbps}
                      onChange={(e) =>
                        setHeartForm({
                          ...heartForm,
                          trestbps: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400">Normal: &lt;120 mm Hg</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Serum Cholesterol (mg/dL)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="550"
                      value={heartForm.chol}
                      onChange={(e) =>
                        setHeartForm({
                          ...heartForm,
                          chol: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    />
                    <span className="text-[11px] text-slate-400">Desirable: &lt;200 mg/dL</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Max Heart Rate Achieved (thalach)
                    </label>
                    <input
                      type="number"
                      min="60"
                      max="220"
                      value={heartForm.thalach}
                      onChange={(e) =>
                        setHeartForm({
                          ...heartForm,
                          thalach: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Exercise-Induced Angina (exang)
                    </label>
                    <select
                      value={heartForm.exang}
                      onChange={(e) =>
                        setHeartForm({ ...heartForm, exang: parseInt(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value={0}>No (No chest discomfort on exertion)</option>
                      <option value={1}>Yes (Chest discomfort during exercise)</option>
                    </select>
                  </div>

                  {/* Top contributor: ca */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Major Fluoroscopy Vessels (ca: 0–3)
                    </label>
                    <select
                      value={heartForm.ca}
                      onChange={(e) =>
                        setHeartForm({ ...heartForm, ca: parseInt(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value={0}>0 vessels colored (clear flow)</option>
                      <option value={1}>1 vessel colored</option>
                      <option value={2}>2 vessels colored</option>
                      <option value={3}>3 vessels colored (significant)</option>
                    </select>
                    <span className="text-[11px] text-slate-400 font-medium text-rose-600 dark:text-rose-400">
                      ★ Top Model Predictor (+1.11 weight)
                    </span>
                  </div>

                  {/* Top contributor: thal */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Thalassemia Flow Status (thal)
                    </label>
                    <select
                      value={heartForm.thal}
                      onChange={(e) =>
                        setHeartForm({ ...heartForm, thal: parseInt(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value={1}>1 = Normal Blood Flow</option>
                      <option value={2}>2 = Fixed Perfusion Defect</option>
                      <option value={3}>3 = Reversible Perfusion Defect</option>
                    </select>
                    <span className="text-[11px] text-slate-400 font-medium text-rose-600 dark:text-rose-400">
                      ★ Top Model Predictor (+0.68 weight)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Exercise ST Depression (oldpeak)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="6.5"
                      value={heartForm.oldpeak}
                      onChange={(e) =>
                        setHeartForm({
                          ...heartForm,
                          oldpeak: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">ST depression in mm (0.0–6.0)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Peak Exercise ST Slope
                    </label>
                    <select
                      value={heartForm.slope}
                      onChange={(e) =>
                        setHeartForm({ ...heartForm, slope: parseInt(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value={0}>0 = Upsloping</option>
                      <option value={1}>1 = Flat</option>
                      <option value={2}>2 = Downsloping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fasting Blood Sugar &gt; 120 mg/dL
                    </label>
                    <select
                      value={heartForm.fbs}
                      onChange={(e) =>
                        setHeartForm({ ...heartForm, fbs: parseInt(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value={0}>No (Normal FBS &le; 120)</option>
                      <option value={1}>Yes (Elevated FBS &gt; 120)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Evaluating Cardiovascular Risk...
                    </>
                  ) : (
                    <>
                      <Heart className="h-4 w-4" />
                      Calculate Heart Disease Risk Score
                    </>
                  )}
                </button>
              </form>
            )}

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results & Explainability Card */}
          <div className="lg:col-span-6 space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Score & Gauge Card */}
                  {(() => {
                    const style = getRiskColor(result.riskLevel);
                    const StatusIcon = style.icon;
                    return (
                      <div
                        className={`rounded-3xl border-2 ${style.border} ${style.bg} p-6 sm:p-8 shadow-md`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full ${style.badge}`}
                          >
                            {result.riskLevel} CLINICAL RISK
                          </span>
                          <StatusIcon className={`h-6 w-6 ${style.text}`} />
                        </div>

                        <div className="mt-6 flex items-baseline gap-3">
                          <span className="text-5xl font-black text-slate-900 dark:text-white">
                            {result.riskPercentage}%
                          </span>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Estimated Probability
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, result.riskPercentage)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full ${style.bar} rounded-full`}
                          />
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                          {result.recommendation}
                        </p>

                        {/* Doctor CTA if Medium or High */}
                        {(result.riskLevel === "MEDIUM" || result.riskLevel === "HIGH") && (
                          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                            <Link
                              href="/find-doctor"
                              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
                            >
                              <Calendar className="h-4 w-4" />
                              Book a Specialist Consultation on CuraLink
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Explainability Bar Chart */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <BarChart3 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Feature Importance (Explainability)
                      </h3>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      How each clinical biomarker influenced the model&apos;s risk score:
                    </p>

                    <div className="mt-6 space-y-3.5">
                      {result.featureImportance.map((item, idx) => {
                        const isRisk = item.direction === "increases_risk";
                        const maxAbs = Math.max(
                          ...result.featureImportance.map((f) => Math.abs(f.contribution)),
                          1.0
                        );
                        const widthPct = Math.min(100, Math.round((Math.abs(item.contribution) / maxAbs) * 100));

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {item.displayName} ({item.rawValue})
                              </span>
                              <span
                                className={`font-mono text-[11px] font-bold flex items-center gap-1 ${
                                  isRisk
                                    ? "text-rose-600 dark:text-rose-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {isRisk ? (
                                  <>
                                    <TrendingUp className="h-3 w-3" />
                                    +{Math.abs(item.contribution).toFixed(2)}
                                  </>
                                ) : (
                                  <>
                                    <TrendingDown className="h-3 w-3" />
                                    -{Math.abs(item.contribution).toFixed(2)} (protective)
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Bar Visual */}
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${widthPct}%` }}
                                className={`h-full rounded-full ${
                                  isRisk
                                    ? "bg-rose-500 dark:bg-rose-400"
                                    : "bg-emerald-500 dark:bg-emerald-400"
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        {result.disclaimer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Empty / Intro Card */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-sm"
                >
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Activity className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Awaiting Clinical Input
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Fill in your health numbers on the left and click &quot;Calculate Risk Score&quot; to view real-time machine learning predictions with visual explainability.
                  </p>
                  <div className="pt-4 grid grid-cols-2 gap-3 text-left">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Explainable AI</p>
                      <p className="text-[11px] text-slate-500 mt-1">See exact mathematical weight contribution for every biomarker.</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Doctor Referral</p>
                      <p className="text-[11px] text-slate-500 mt-1">Directly connect with top verified specialists if elevated risk is detected.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

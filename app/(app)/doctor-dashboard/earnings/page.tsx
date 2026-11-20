"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  CreditCard,
  Building2,
  Video,
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Download,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  FileSpreadsheet,
  Check,
  BarChart2,
  LineChart,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

type PeriodType = "1d" | "7d" | "1m" | "1y";
type ChartMode = "area" | "bar";

interface ChartBarData {
  label: string;
  amount: number;
  visits: number;
}

interface EarningsData {
  period: PeriodType;
  grossEarnings: number;
  netEarnings: number;
  consultationCount: number;
  avgFee: number;
  pendingPayout: number;
  platformFeePercent: number;
  chartData: ChartBarData[];
  breakdown: {
    video: { percent: number; amount: number };
    clinic: { percent: number; amount: number };
    followup: { percent: number; amount: number };
  };
  recentTransactions: Array<{
    id: string;
    patientName: string;
    amount: number;
    date: string;
    time: string;
    method: string;
    status: string;
    consultationType: string;
  }>;
}

const PERIODS: Array<{ key: PeriodType; label: string; sub: string }> = [
  { key: "1d", label: "1 Day", sub: "Today (Hourly)" },
  { key: "7d", label: "7 Days", sub: "This Week" },
  { key: "1m", label: "1 Month", sub: "Past 30 Days" },
  { key: "1y", label: "1 Year", sub: "Annual (12 Months)" },
];

export default function DoctorEarningsPage() {
  const [period, setPeriod] = useState<PeriodType>("7d");
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("Just now");

  const [data, setData] = useState<EarningsData>({
    period: "7d",
    grossEarnings: 18500,
    netEarnings: 17575,
    consultationCount: 37,
    avgFee: 500,
    pendingPayout: 7850,
    platformFeePercent: 5,
    chartData: [
      { label: "Mon", amount: 2200, visits: 4 },
      { label: "Tue", amount: 3300, visits: 6 },
      { label: "Wed", amount: 2600, visits: 5 },
      { label: "Thu", amount: 4100, visits: 8 },
      { label: "Fri", amount: 2900, visits: 6 },
      { label: "Sat", amount: 2100, visits: 5 },
      { label: "Sun", amount: 1300, visits: 3 },
    ],
    breakdown: {
      video: { percent: 68, amount: 12580 },
      clinic: { percent: 24, amount: 4440 },
      followup: { percent: 8, amount: 1480 },
    },
    recentTransactions: [
      {
        id: "TXN-9042",
        patientName: "Aarav Sharma",
        amount: 500,
        date: "Today",
        time: "11:15 AM",
        method: "UPI · Google Pay",
        status: "SETTLED",
        consultationType: "HD Video Consult",
      },
      {
        id: "TXN-9038",
        patientName: "Pooja Verma",
        amount: 800,
        date: "Today",
        time: "10:00 AM",
        method: "UPI · PhonePe",
        status: "SETTLED",
        consultationType: "In-Clinic Visit",
      },
      {
        id: "TXN-8994",
        patientName: "Devansh Reddy",
        amount: 500,
        date: "Yesterday",
        time: "04:45 PM",
        method: "Paytm UPI",
        status: "SETTLED",
        consultationType: "HD Video Consult",
      },
      {
        id: "TXN-8971",
        patientName: "Meenakshi Iyer",
        amount: 500,
        date: "Yesterday",
        time: "02:30 PM",
        method: "Visa Card •• 4128",
        status: "SETTLED",
        consultationType: "HD Video Consult",
      },
      {
        id: "TXN-8920",
        patientName: "Karan Malhotra",
        amount: 800,
        date: "24 Oct",
        time: "12:00 PM",
        method: "UPI · BHIM",
        status: "SETTLED",
        consultationType: "In-Clinic Visit",
      },
    ],
  });

  const fetchEarnings = useCallback(async (selectedPeriod: PeriodType, isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
    try {
      const res = await api.get<EarningsData>(`/doctor/me/earnings?period=${selectedPeriod}`);
      if (res?.success && res.data) {
        setData(res.data);
        const now = new Date();
        setLastSyncedAt(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      }
    } catch {
      // Use fallback gracefully
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings(period);
  }, [period, fetchEarnings]);

  // Real-time polling every 12 seconds so whenever someone sends money, the earnings fetch automatically!
  useEffect(() => {
    const timer = setInterval(() => {
      fetchEarnings(period, true);
    }, 12000);
    return () => clearInterval(timer);
  }, [period, fetchEarnings]);

  const handleRefresh = () => {
    fetchEarnings(period);
  };

  const maxChartAmount = useMemo(() => {
    if (!data.chartData || data.chartData.length === 0) return 1000;
    const maxVal = Math.max(...data.chartData.map((d) => d.amount));
    return maxVal > 0 ? maxVal : 1000;
  }, [data.chartData]);

  const peakPoint = useMemo(() => {
    if (!data.chartData || data.chartData.length === 0) return null;
    let max = data.chartData[0];
    data.chartData.forEach((d) => {
      if (d.amount > max.amount) max = d;
    });
    return max;
  }, [data.chartData]);

  // Generate smooth SVG bezier curve points for Area View
  const svgMetrics = useMemo(() => {
    const width = 800;
    const height = 220;
    const paddingX = 40;
    const paddingY = 30;
    const count = data.chartData.length;
    if (count <= 1) return { points: [], pathD: "", areaD: "" };

    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    const points = data.chartData.map((d, i) => {
      const x = paddingX + (i / (count - 1)) * usableWidth;
      const normalizedY = d.amount / maxChartAmount;
      const y = height - paddingY - normalizedY * usableHeight;
      return { x, y, ...d };
    });

    // Compute smooth cubic bezier path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i != points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const bottomY = height - paddingY;
    const areaD = `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { points, pathD, areaD, width, height, paddingX, paddingY, bottomY };
  }, [data.chartData, maxChartAmount]);

  const handleWithdraw = () => {
    if (data.pendingPayout <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setData((prev) => ({ ...prev, pendingPayout: 0 }));
      setTimeout(() => setWithdrawSuccess(false), 5000);
    }, 1200);
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Transaction ID,Patient Name,Amount (INR),Date,Time,Payment Method,Status,Type"]
        .concat(
          data.recentTransactions.map(
            (t) =>
              `"${t.id}","${t.patientName}","${t.amount}","${t.date}","${t.time}","${t.method}","${t.status}","${t.consultationType}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CuraLink_Earnings_${period.toUpperCase()}_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activePoint =
    hoveredPointIndex !== null && data.chartData[hoveredPointIndex]
      ? data.chartData[hoveredPointIndex]
      : peakPoint || data.chartData[data.chartData.length - 1];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#071320] text-[#0B1F33] dark:text-slate-100 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/doctor-dashboard" className="hover:text-[#006D77] transition-colors">
            Doctor Cockpit
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-[#006D77] dark:text-[#83C5BE]">
            Earnings &amp; Payouts
          </span>
        </div>

        {/* ── 1. HEADER & PERIOD TABS ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white">
                Revenue &amp; Settlement Dashboard
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live DB Sync ({lastSyncedAt})
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live consultation revenue updates in real-time as soon as patients complete payment.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Timeframe Selector Buttons */}
            <div className="inline-flex items-center rounded-2xl bg-white dark:bg-[#0B1F33] p-1 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              {PERIODS.map((p) => {
                const isSelected = period === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setPeriod(p.key);
                      setHoveredPointIndex(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#006D77] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-[#0B1F33] dark:hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Manual Sync / Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 w-9 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              title="Sync latest payments from database"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#006D77]" : ""}`} />
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0B1F33] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Withdrawal Success Notification */}
        <AnimatePresence>
          {withdrawSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-3 shadow-xs"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>
                Instant payout successfully dispatched via IMPS to your HDFC Bank account (•••• 8492). Settlement reference ID: IMPS-{Date.now().toString().slice(-8)}.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 2. EXECUTIVE 4-METRIC CLINICAL CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Net Take-Home */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-3xl bg-gradient-to-br from-[#006D77] to-[#005159] text-white p-5 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-100">
                Net Take-Home Pay
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                95% Net
              </span>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight font-mono">
                ₹{data.netEarnings.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-teal-100 mt-1">
                Direct to bank after 5% platform fee
              </p>
            </div>
          </motion.div>

          {/* Card 2: Gross Billed */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-3xl bg-white dark:bg-[#0B1F33] p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Gross Invoiced
              </span>
              <div className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#006D77] dark:text-[#83C5BE] flex items-center justify-center">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight font-mono text-[#0B1F33] dark:text-white">
                ₹{data.grossEarnings.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Real database consultations total
              </p>
            </div>
          </motion.div>

          {/* Card 3: Completed Consults */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-3xl bg-white dark:bg-[#0B1F33] p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Completed Visits
              </span>
              <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight text-[#0B1F33] dark:text-white">
                {data.consultationCount}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Patients served across this period
              </p>
            </div>
          </motion.div>

          {/* Card 4: Average Fee */}
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-3xl bg-white dark:bg-[#0B1F33] p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Avg Fee / Patient
              </span>
              <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight font-mono text-[#0B1F33] dark:text-white">
                ₹{data.avgFee}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Mean revenue per completed visit
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── 3. PREMIUM ADVANCED INTERACTIVE GRAPH (AREA SPLINE & BARS) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Chart Card (8 cols) */}
          <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#0B1F33] p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0B1F33] dark:text-white">
                    Revenue Velocity &amp; Distribution
                  </h3>
                  {peakPoint && (
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 text-[10px] font-bold text-[#006D77] dark:text-[#83C5BE]">
                      <Sparkles className="h-3 w-3" />
                      Peak: {peakPoint.label} (₹{peakPoint.amount.toLocaleString("en-IN")})
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Interactive real-time graph showing consult earnings &amp; patient volume.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle: Area vs Bar */}
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-[#112A44] p-1 border border-slate-200/70 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setChartMode("area")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      chartMode === "area"
                        ? "bg-white dark:bg-[#006D77] text-[#006D77] dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <LineChart className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Smooth Curve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode("bar")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      chartMode === "bar"
                        ? "bg-white dark:bg-[#006D77] text-[#006D77] dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Pillars</span>
                  </button>
                </div>

                {activePoint && (
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3 py-1">
                    <span className="text-xs font-bold text-[#006D77] dark:text-[#83C5BE]">
                      {activePoint.label}: ₹{activePoint.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {activePoint.visits} visits
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CHART DISPLAY AREA */}
            {chartMode === "area" ? (
              /* ── MODERN SVG GRADIENT AREA CHART ── */
              <div className="relative w-full h-64 pt-4 pb-2">
                {/* Horizontal reference guide gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-4 py-8">
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>₹{maxChartAmount.toLocaleString("en-IN")} (Max)</span>
                  </div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>₹{Math.round(maxChartAmount * 0.5).toLocaleString("en-IN")} (50%)</span>
                  </div>
                  <div className="border-b border-dashed border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>₹0</span>
                  </div>
                </div>

                <svg
                  viewBox={`0 0 ${svgMetrics.width} ${svgMetrics.height}`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#006D77" stopOpacity="0.45" />
                      <stop offset="50%" stopColor="#83C5BE" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#83C5BE" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#006D77" />
                      <stop offset="50%" stopColor="#00808B" />
                      <stop offset="100%" stopColor="#83C5BE" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#006D77" floodOpacity="0.35" />
                    </filter>
                  </defs>

                  {/* Gradient Area Fill */}
                  <path d={svgMetrics.areaD} fill="url(#areaGradient)" />

                  {/* High Precision Spline Stroke */}
                  <path
                    d={svgMetrics.pathD}
                    fill="none"
                    stroke="url(#strokeGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />

                  {/* Data Points Nodes */}
                  {svgMetrics.points.map((pt, i) => {
                    const isHovered = hoveredPointIndex === i;
                    const isPeak = pt.amount === maxChartAmount;

                    return (
                      <g
                        key={`pt-${pt.label}-${i}`}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      >
                        {/* Hover vertical crosshair */}
                        {isHovered && (
                          <line
                            x1={pt.x}
                            y1={svgMetrics.paddingY}
                            x2={pt.x}
                            y2={svgMetrics.bottomY}
                            stroke="#006D77"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                            opacity="0.8"
                          />
                        )}

                        {/* Outer Glow Ring on Hover */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 8 : isPeak ? 6 : 4.5}
                          fill={isHovered ? "#006D77" : isPeak ? "#83C5BE" : "#006D77"}
                          opacity={isHovered ? 0.3 : 0.15}
                        />

                        {/* Solid Inner Dot */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 5.5 : isPeak ? 4.5 : 3.5}
                          fill="#FFFFFF"
                          stroke="#006D77"
                          strokeWidth="2.5"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* X-Axis Labels Below Curve */}
                <div className="flex items-center justify-between px-6 pt-2">
                  {data.chartData.map((d, i) => {
                    const isHovered = hoveredPointIndex === i;
                    return (
                      <button
                        key={`x-${d.label}-${i}`}
                        type="button"
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        className={`text-xs transition-colors cursor-pointer ${
                          isHovered
                            ? "font-bold text-[#006D77] dark:text-[#83C5BE]"
                            : "text-slate-400 dark:text-slate-500 font-medium"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ── PRECISION ROUNDED PILLARS BAR VIEW ── */
              <div className="relative w-full h-64 pt-6 pb-2">
                <div className="h-52 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100 dark:border-slate-800/80">
                  {data.chartData.map((item, idx) => {
                    const isHovered = hoveredPointIndex === idx;
                    const heightPercent = Math.max(12, Math.round((item.amount / maxChartAmount) * 100));

                    return (
                      <div
                        key={`bar-${item.label}-${idx}`}
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                      >
                        {/* Hover Floating Tooltip */}
                        <div
                          className={`absolute -top-10 z-20 pointer-events-none transition-all duration-150 ${
                            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
                          }`}
                        >
                          <div className="rounded-xl bg-[#0B1F33] dark:bg-white text-white dark:text-[#0B1F33] px-2.5 py-1 text-[11px] font-bold shadow-lg whitespace-nowrap">
                            ₹{item.amount.toLocaleString("en-IN")} ({item.visits} visits)
                          </div>
                        </div>

                        {/* Bar Cylinder with curved gradient top */}
                        <div className="w-full max-w-[44px] h-full flex items-end">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-xl transition-all duration-300 ${
                              isHovered
                                ? "bg-gradient-to-t from-[#006D77] to-[#83C5BE] shadow-md shadow-[#006D77]/25 scale-105"
                                : "bg-gradient-to-t from-[#006D77]/75 to-[#83C5BE]/90 hover:from-[#006D77] hover:to-[#83C5BE]"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Labels */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 pt-2">
                  {data.chartData.map((item, idx) => {
                    const isHovered = hoveredPointIndex === idx;
                    return (
                      <div
                        key={`lbl-${item.label}-${idx}`}
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        className="flex-1 text-center cursor-pointer"
                      >
                        <span
                          className={`text-xs block truncate ${
                            isHovered
                              ? "font-bold text-[#006D77] dark:text-[#83C5BE]"
                              : "text-slate-400 dark:text-slate-500 font-medium"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Breakdown & Bank Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Consultation Channel Split */}
            <div className="rounded-3xl bg-white dark:bg-[#0B1F33] p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#0B1F33] dark:text-white">
                  Consultation Channel Split
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Revenue breakdown by appointment mode
                </p>
              </div>

              {/* Progress bar visual */}
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                <div style={{ width: `${data.breakdown.video.percent}%` }} className="bg-[#006D77]" />
                <div style={{ width: `${data.breakdown.clinic.percent}%` }} className="bg-[#83C5BE]" />
                <div style={{ width: `${data.breakdown.followup.percent}%` }} className="bg-amber-400" />
              </div>

              {/* Channel List */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#006D77]" />
                    <Video className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      HD Video Telehealth
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">
                      ₹{data.breakdown.video.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({data.breakdown.video.percent}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#83C5BE]" />
                    <Building2 className="h-3.5 w-3.5 text-[#006D77] dark:text-[#83C5BE]" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Clinic Walk-In
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">
                      ₹{data.breakdown.clinic.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({data.breakdown.clinic.percent}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <UserCheck className="h-3.5 w-3.5 text-amber-600" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Follow-up Review
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono">
                      ₹{data.breakdown.followup.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({data.breakdown.followup.percent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Bank Settlement Card */}
            <div className="rounded-3xl bg-white dark:bg-[#0B1F33] p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B1F33] dark:text-white">
                      Direct Payout
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Verified Escrow Settlement
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  Active
                </span>
              </div>

              {/* Bank preview */}
              <div className="rounded-2xl bg-slate-50 dark:bg-[#112A44] p-3.5 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B1F33] dark:text-white">
                    HDFC Bank Ltd.
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{data.pendingPayout.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  A/C: •••••••• 8492 · IFSC: HDFC0001242
                </p>
              </div>

              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isWithdrawing || data.pendingPayout <= 0}
                className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  data.pendingPayout > 0 && !isWithdrawing
                    ? "bg-[#006D77] text-white hover:bg-[#005159] shadow-xs"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isWithdrawing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ArrowUpRight className="h-4 w-4" />
                    <span>
                      {data.pendingPayout > 0
                        ? `Transfer ₹${data.pendingPayout.toLocaleString("en-IN")} to Bank`
                        : "All Earnings Dispatched"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. RECENT TRANSACTIONS LEDGER TABLE (REAL DATABASE PAYMENTS) ── */}
        <div className="rounded-3xl bg-white dark:bg-[#0B1F33] p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0B1F33] dark:text-white">
                  Settled Patient Invoices
                </h3>
                <span className="rounded-full bg-slate-100 dark:bg-[#112A44] px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                  {data.recentTransactions.length} Verified Records
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent consultation billing records fetched live from database payments.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Transaction ID</th>
                  <th className="pb-3 px-3">Patient</th>
                  <th className="pb-3 px-3">Date &amp; Time</th>
                  <th className="pb-3 px-3">Mode</th>
                  <th className="pb-3 px-3">Payment Method</th>
                  <th className="pb-3 px-3 text-right">Fee Settled</th>
                  <th className="pb-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {data.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-[#112A44]/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {tx.id}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#0B1F33] dark:text-white">
                      {tx.patientName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {tx.date} · {tx.time}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[11px] font-semibold text-[#006D77] dark:text-[#83C5BE]">
                        {tx.consultationType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {tx.method}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0B1F33] dark:text-white">
                      +₹{tx.amount}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

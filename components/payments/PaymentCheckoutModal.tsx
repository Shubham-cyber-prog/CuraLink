"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Smartphone,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Lock,
  Printer,
  Video,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateIST } from "@/lib/clinical-formatters";

export interface PaymentReceipt {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: string;
  methodDetail: string;
  doctorName: string;
  date: string;
  time: string;
  paidAt: string;
}

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
  amount: number;
  onSuccess?: (receipt: PaymentReceipt) => void;
}

const UPI_APPS = [
  { label: "Google Pay", suffix: "@okaxis" },
  { label: "PhonePe", suffix: "@ybl" },
  { label: "Paytm", suffix: "@paytm" },
  { label: "BHIM UPI", suffix: "@upi" },
];

const BANKS = [
  "HDFC Bank",
  "ICICI Bank",
  "State Bank of India (SBI)",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank",
];

export function PaymentCheckoutModal({
  isOpen,
  onClose,
  appointmentId,
  doctorName,
  specialty,
  date,
  time,
  amount,
  onSuccess,
}: PaymentCheckoutModalProps) {
  const [method, setMethod] = useState<"UPI" | "CARD" | "NETBANKING">("UPI");
  const [upiId, setUpiId] = useState("subham@okaxis");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  if (!isOpen) return null;

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (method === "UPI") {
      if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        setError("Enter a valid UPI ID (e.g., name@okaxis or 9876543210@ybl).");
        return;
      }
    }

    if (method === "CARD") {
      const digits = cardNumber.replace(/\D/g, "");
      if (digits.length < 12) {
        setError("Enter a valid 16-digit card number.");
        return;
      }
      if (!cardHolder.trim()) {
        setError("Enter the cardholder name.");
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setError("Enter expiry in MM/YY format.");
        return;
      }
      if (cardCvv.replace(/\D/g, "").length < 3) {
        setError("Enter a valid 3-digit CVV.");
        return;
      }
    }

    setIsProcessing(true);
    try {
      const payload: Record<string, any> = {
        appointmentId,
        method,
      };
      if (method === "UPI") payload.upiId = upiId.trim();
      if (method === "CARD") payload.cardLast4 = cardNumber.replace(/\D/g, "").slice(-4);
      if (method === "NETBANKING") payload.bankName = selectedBank;

      const res = await api.post("/payments/checkout", payload);
      if (!res?.success || !res.data?.receipt) {
        throw new Error(res?.message || "Payment failed. Please try again.");
      }

      const confirmedReceipt: PaymentReceipt = res.data.receipt;
      setReceipt(confirmedReceipt);
      onSuccess?.(confirmedReceipt);
    } catch (err: any) {
      setError(err?.message || "Unable to complete payment. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1F33]/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-[24px] bg-white dark:bg-[#0B1F33] border border-slate-200/80 dark:border-white/[0.1] shadow-2xl overflow-hidden">
        {/* Top Navy-Teal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0B1F33] via-[#0E3145] to-[#006D77] text-white">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-[#83C5BE]" />
            <div>
              <h3 className="text-sm font-semibold">CuraLink Secure Checkout</h3>
              <p className="text-[11px] text-[#83C5BE]">256-bit Encrypted Payment</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close payment window"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {receipt ? (
          /* ── SUCCESS RECEIPT VIEW ── */
          <div className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="font-serif text-2xl text-[#0B1F33] dark:text-white">
                Payment Successful
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your consultation is confirmed and ready for video call.
              </p>
            </div>

            <div className="rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor</span>
                <span className="font-semibold text-[#0B1F33] dark:text-white">{receipt.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Schedule</span>
                <span className="font-medium text-[#0B1F33] dark:text-white">
                  {formatDateIST(receipt.date)} • {receipt.time} IST
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium text-[#0B1F33] dark:text-white">
                  {receipt.method} ({receipt.methodDetail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-[#006D77] dark:text-[#83C5BE] font-semibold">
                  {receipt.transactionId}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200/70 dark:border-white/[0.08] text-sm">
                <span className="font-semibold text-[#0B1F33] dark:text-white">Amount Paid</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{receipt.amount} INR
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/consultation/${appointmentId}`}
                onClick={onClose}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-[#006D77] hover:bg-[#005860] text-xs font-medium text-white shadow-sm"
              >
                <Video className="h-4 w-4" />
                <span>Join Video Room</span>
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-slate-200 dark:border-white/[0.12] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center h-10 px-4 rounded-full border border-slate-200 dark:border-white/[0.12] text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.06] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* ── PAYMENT FORM VIEW ── */
          <form onSubmit={handlePay} className="p-6 space-y-5">
            {/* Summary Strip */}
            <div className="rounded-2xl bg-[#F4F7F8] dark:bg-white/[0.04] p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0B1F33] dark:text-white truncate">
                  {doctorName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {specialty ? `${specialty} • ` : ""}
                  {formatDateIST(date)} at {time} IST
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-slate-500">Total Payable</p>
                <p className="text-lg font-bold text-[#006D77] dark:text-[#83C5BE]">₹{amount}</p>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "UPI" as const, label: "UPI", icon: Smartphone },
                { key: "CARD" as const, label: "Card", icon: CreditCard },
                { key: "NETBANKING" as const, label: "Net Banking", icon: Building2 },
              ].map((m) => {
                const Icon = m.icon;
                const active = method === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => {
                      setMethod(m.key);
                      setError(null);
                    }}
                    className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3 px-2 text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? "border-[#006D77] bg-[#006D77]/[0.08] text-[#006D77] dark:text-[#83C5BE] font-semibold"
                        : "border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Method-specific Fields */}
            {method === "UPI" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {UPI_APPS.map((app) => (
                    <button
                      key={app.label}
                      type="button"
                      onClick={() => {
                        const base = upiId.split("@")[0] || "patient";
                        setUpiId(`${base}${app.suffix}`);
                      }}
                      className="rounded-full border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-[#006D77] hover:text-[#006D77] cursor-pointer"
                    >
                      {app.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-3.5 text-sm text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white dark:focus:bg-[#0B1F33] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {method === "CARD" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Card Number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-3.5 text-sm font-mono text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Subham Nayak"
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-3.5 text-sm text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="12/28"
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-3.5 text-sm font-mono text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      CVV
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="•••"
                      className="w-full h-10 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-[#F4F7F8] dark:bg-[#071320] px-3.5 text-sm font-mono text-slate-900 dark:text-white focus:border-[#006D77] focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {method === "NETBANKING" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Select Your Bank
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BANKS.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all cursor-pointer ${
                        selectedBank === bank
                          ? "border-[#006D77] bg-[#006D77]/[0.08] text-[#006D77] dark:text-[#83C5BE] font-semibold"
                          : "border-slate-200 dark:border-white/[0.1] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full bg-[#006D77] hover:bg-[#005860] text-sm font-semibold text-white shadow-[0_6px_18px_-4px_rgba(0,109,119,0.45)] transition-all cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Pay ₹{amount} &amp; Confirm Visit</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Instant confirmation • 100% refund on cancellation before consultation
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

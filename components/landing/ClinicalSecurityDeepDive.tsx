"use client";

import React from "react";
import { Lock, ShieldCheck, KeyRound, Server, UserCheck, Terminal } from "lucide-react";
import { motion } from "framer-motion";

const SECURITY_SPECS = [
  {
    icon: Lock,
    code: "TLS_1.3_ENCRYPT",
    title: "Transport Layer Cryptography",
    description:
      "All API endpoints, WebSocket signals, and WebRTC handshakes are routed over HTTPS/TLS 1.3, guaranteeing strict transit secrecy against network snooping.",
  },
  {
    icon: UserCheck,
    code: "RBAC_TENANT_ISOLATION",
    title: "Role-Based Record Segregation",
    description:
      "Database schema enforces strict isolation. Physicians can only query patient dossiers attached to an active, authorized consultation booking.",
  },
  {
    icon: KeyRound,
    code: "JWT_CRYPTOGRAPHIC_SIG",
    title: "Cryptographic Session Integrity",
    description:
      "Sessions are authenticated with cryptographically signed JSON Web Tokens stored in secure HTTP-only cookies, immune to client-side script tampering.",
  },
  {
    icon: Server,
    code: "SALTED_HASH_CREDENTIALS",
    title: "Irreversible Credential Safety",
    description:
      "User passkeys and authentication credentials are encrypted using salted multi-round hashing. Plaintext credentials never touch disk or logs.",
  },
  {
    icon: ShieldCheck,
    code: "RESTRICTED_API_GUARD",
    title: "Deterministic API Boundaries",
    description:
      "Every API handler enforces schema validation via strict typed parsing, zero-trust parameter sanitization, and automated rate limiting.",
  },
  {
    icon: Terminal,
    code: "EPHEMERAL_WEBRTC_ROOMS",
    title: "Zero-Trace Video Rooms",
    description:
      "Video consultation rooms are generated just-in-time per confirmed booking and permanently torn down post-visit. No unauthorized surveillance.",
  },
];

export function ClinicalSecurityDeepDive() {
  return (
    <section
      id="security"
      className="relative bg-[#0A0F0D] text-[#F5F3EE] py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/10"
      aria-labelledby="security-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl mb-16 sm:mb-20">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            [ 05 · Sovereign Data Architecture ]
          </span>
          <h2
            id="security-heading"
            className="mt-4 font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#F5F3EE] leading-[1.1]"
          >
            Medical privacy is an{" "}
            <em className="font-serif italic font-normal text-emerald-300">engineering invariant</em>,
            not a marketing promise.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed font-sans">
            Healthcare records contain the most sensitive details of human life. We build with least-privilege access, verifiable encryption, and zero third-party monetization.
          </p>
        </div>

        {/* 6-Grid Technical Specification Matrix */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {SECURITY_SPECS.map((spec) => {
            const Icon = spec.icon;
            return (
              <motion.article
                key={spec.code}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 backdrop-blur-xs hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400/80 bg-emerald-950/50 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {spec.code}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-white group-hover:text-emerald-300 transition-colors">
                    {spec.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-white/60 leading-relaxed font-sans">
                    {spec.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[11px] text-white/40">
                  <span>VERIFIED SPEC</span>
                  <span className="text-emerald-400">ACTIVE</span>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Architectural Commitment Banner */}
        <div className="mt-12 rounded-3xl border border-emerald-500/30 bg-[#085041]/20 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#085041] border border-emerald-400/40 text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-sm text-white">
                Zero Patient Data Monetization Covenant
              </p>
              <p className="text-xs text-white/60 mt-0.5">
                CuraLink will never sell patient records, index health profiles for advertising, or share data without direct clinical consent.
              </p>
            </div>
          </div>
          <span className="shrink-0 font-mono text-xs text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-1.5 rounded-full">
            AUDITED INFRASTRUCTURE
          </span>
        </div>
      </div>
    </section>
  );
}

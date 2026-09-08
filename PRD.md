# CuraLink — Master Product Requirement Document (PRD) & 10/10 Industry Roadmap

> **Target Goal:** Transform CuraLink into a 10/10 Industry-Grade, DPDP Act 2023 & NMC Telemedicine Guidelines 2020 compliant Healthcare Telehealth Platform ready for real production launch in India.

---

## 📌 1. Executive Summary & Tech Stack

CuraLink is an AI-powered telehealth ecosystem serving Patients, Doctors, and Admins across a Next.js Web Application and Expo React Native Mobile Client sharing a single Express.js backend.

### Tech Stack
- **Web Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide React, `@react-oauth/google`
- **Mobile Client:** Expo SDK 57 / React Native 0.86, Expo Router, NativeWind, Expo SecureStore, `expo-auth-session`, `expo-web-browser`
- **Backend Infrastructure:** Express.js, TypeScript (`tsx`), Prisma ORM (SQLite dev / PostgreSQL prod), Zod validation, Daily.co REST API
- **Security & Auth:** Dual JWT tokens (15-min access + 7-day refresh), HttpOnly+SameSite=Lax cookies (web), Bearer token in SecureStore (mobile), Backend-Mediated Google OAuth 2.0 (`curalink://` deep-linking), Double-Submit CSRF cookie (`curalink_csrf`), granular rate limiters, security headers (CSP/HSTS)

---

## 📊 2. Current Implementation Status

| Component | Status | Details |
|---|:---:|---|
| **Authentication & RBAC** | ✅ 100% | Dual JWT, Email/Password, Backend-Mediated Google OAuth, Password Reset, CSRF, SecureStore (mobile) |
| **Real Video/Audio Call** | ✅ 100% | Daily.co REST API, room token generation, pre-call readiness check, Daily Prebuilt call rooms, completion flow |
| **AI Symptom Checker** | ✅ 100% | 24/7 Clinical triage engine, RED/YELLOW/GREEN priority badges, specialist recommendation, possible causes |
| **Doctor Discovery & Booking** | ✅ 100% | Real-time search, specialty pills, slot selection, appointment booking, manage visits |
| **Navigation & Design System** | ✅ 100% | Unified floating curved pill bottom bar (<768px web + mobile app), Healthians-inspired light theme (`#0F9D8C`) |
| **Mobile Backend API Config** | ✅ 100% | Runtime Expo `hostUri` LAN IP auto-detection, Android emulator fallback (`10.0.2.2`), in-app `NetworkAlertBanner` |
| **Automated Test Suite** | ✅ 100% | Jest — 5 test suites, 32 unit & integration tests passing 100% |

---

## 🗺️ 3. Industry 10/10 Layered Roadmap

### Layer 1 — Core Product Completeness (Highest Priority)
- [x] **Real Video/Audio Consultation**: Daily.co integration with meeting token auth and completion status.
- [ ] **Payment Gateway (Razorpay India)**: Consultation fee checkout, automated invoicing, refund handling for cancelled appointments.
- [ ] **Real Email & SMS Notifications**: Resend/SendGrid email triggers + MSG91/Twilio SMS for appointment confirmations & OTPs.
- [ ] **Mobile Push Notifications**: Expo Notifications service for appointment reminders & live doctor messages.
- [ ] **Doctor Onboarding & Verification**: Medical registration license upload, degree proof, and admin verification gate before listing.
- [ ] **PDF E-Prescription Generation**: Downloadable & shareable PDF prescription generated post-consultation.
- [ ] **Real Medical Records Storage**: S3 / Cloudinary encrypted file uploads for prescriptions and lab reports.
- [ ] **Doctor Reviews & Ratings**: Post-consultation rating system with verified patient reviews.

### Layer 2 — Legal & Compliance (Non-Negotiable for Healthcare)
- [ ] **DPDP Act 2023 Compliance**: Digital Personal Data Protection Act compliance for Indian citizens (explicit consent manager, data principal rights).
- [ ] **NMC Telemedicine Practice Guidelines 2020**: National Medical Commission guidelines compliance for remote doctor-patient consultations.
- [ ] **Privacy Policy & Terms of Service**: Legally drafted policies for telehealth, data handling, and liability disclaimers.
- [ ] **Data Retention & Account Deletion**: User-initiated account and data erasure pipeline.
- [ ] **Cookie & Consent Manager**: Explicit cookie consent banner for web analytics & session cookies.

### Layer 3 — Infrastructure & DevOps
- [ ] **Multi-Environment Setup**: Strict separation of `local dev` -> `staging` -> `production`.
- [ ] **CI/CD Automation**: GitHub Actions pipeline auto-running tests & lint checks before merging PRs.
- [ ] **Production Hosting**: Railway/AWS for Express API, Supabase/Neon for managed PostgreSQL, Vercel for Next.js.
- [ ] **Error & Uptime Monitoring**: Sentry for error tracking + UptimeRobot for server health alerts.
- [ ] **Automated Database Backups**: Daily automated PostgreSQL snapshots with tested restore procedures.

### Layer 4 — Quality, Testing & Security
- [ ] **End-to-End Testing**: Playwright test suite covering signup -> book appointment -> join call -> payment.
- [ ] **Accessibility (WCAG 2.1 AA)**: Full keyboard navigation, screen reader support, and high contrast compliance.
- [ ] **Security Audit & Pen-Testing**: OWASP Top 10 audit, rate-limit stress test, and dependency vulnerability scans (`npm audit`).

### Layer 5 — Business, Operations & Analytics
- [ ] **Admin Operations Tooling**: Dispute resolution, manual refund triggers, account suspension, and support ticket management.
- [ ] **Customer Support Channel**: In-app help desk + dedicated support email.
- [ ] **Product Analytics**: PostHog / GA4 funnel tracking for conversion optimization.

---

## 🎯 4. Order of Attack & Milestones

```
Phase 1: Product Completeness (Make it actually usable)
  ├── 1. Payment Gateway (Razorpay integration for consultation fees)
  ├── 2. Doctor Onboarding & Medical License Verification (Admin approval gate)
  ├── 3. Real Email, SMS & Mobile Push Notifications (Resend + MSG91 + Expo Push)
  ├── 4. PDF E-Prescription Generation & Encrypted Records Storage (S3/Cloudinary)
  └── 5. Doctor Ratings & Verified Patient Reviews

Phase 2: Legal & Compliance (Make it legally launchable)
  ├── 1. DPDP Act 2023 & IT Rules 2021 Data Compliance
  ├── 2. NMC Telemedicine Practice Guidelines 2020 Compliance
  └── 3. Drafted Privacy Policy, Terms of Service & Account Deletion Pipeline

Phase 3: Infrastructure & Quality (Make it production-stable)
  ├── 1. Vercel + Railway + Managed PostgreSQL Deployment with Custom Domain & SSL
  ├── 2. CI/CD GitHub Actions Pipeline
  ├── 3. Sentry Error Tracking & Uptime Monitoring
  └── 4. Playwright End-to-End Automated Test Suite

Phase 4: Operations & Launch (Make it a real business)
  ├── 1. Admin Operations Tooling (Refunds, Account Suspensions, Support Desk)
  └── 2. Analytics & SEO Optimization
```

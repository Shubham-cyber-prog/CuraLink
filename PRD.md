# CuraLink — Product Requirement Document (PRD) & Build Status

**Current Status:** Phase 1 & 2 Complete — Core Auth (incl. Google OAuth 2.0), AI Triage, Doctor Discovery, Appointment Booking, Role-Based Dashboards, Mobile Client, Security Hardening, Full Test Suite.

---

## 1. Tech Stack

- **Web:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide React, `@react-oauth/google`, Next-Themes
- **Mobile:** Expo / React Native, Expo Router, NativeWind, Expo SecureStore
- **Backend:** Express.js + TypeScript (`tsx` watch server), Prisma ORM (SQLite/PostgreSQL), Zod validation
- **Security:** Dual JWT tokens (15-min access + 7-day refresh), HttpOnly+SameSite=Lax cookies (web), Bearer token (mobile), double-submit CSRF cookie (`curalink_csrf`), granular rate limiters, CSP/HSTS headers

---

## 2. Module Status

| Module | Status |
|---|---|
| Authentication (email, Google OAuth 2.0, JWT refresh, password reset, CSRF, session persistence) | 100% |
| Real Video/Audio Consultation (Daily.co REST API, meeting tokens, pre-call check, Daily Prebuilt call room, audit logs) | 100% |
| AI Symptom Checker (urgency triage, specialist recommendation) | 100% |
| Doctor Discovery & Booking (search, profiles, slot booking, appointments mgmt) | 100% |
| Role-Based Portals (Patient/Doctor/Admin dashboards, RBAC) | 100% |
| Mobile Client (auth, onboarding, tab nav, Bearer-token API) | 90% |
| Testing (Jest — 5 suites, 32 tests passing) | 100% |

**Fix History:**
- **Website Login Cookies**: Fixed `credentials: "omit"` to `credentials: "include"` across all auth fetch calls.
- **CSRF Protection**: Exempted unauthenticated auth endpoints (`/login`, `/register`, `/google`, `/logout`, `/forgot-password`, `/reset-password`) from CSRF check while keeping it strictly active on non-auth state-changing routes (e.g. appointment booking).
- **Mobile Login**: Backend response now returns `data: { user, token: accessToken }` along with HTTP cookies in the same response.
- **Google OAuth 2.0 Button**: Fixed response stream re-read crash (`res.text()`) and updated Content-Security-Policy (CSP) headers in `next.config.ts` and `security-headers.middleware.ts` to allow Google Identity Services (`https://accounts.google.com`, `https://gsi.gstatic.com`, `https://apis.google.com`, `frame-src`).

---

## 3. Design System (Healthians-inspired, light-first)

```
Background:      #F8FAFC
Card surface:     #FFFFFF
Primary accent:   Teal/Emerald (#0F9D8C)
Secondary accent: Soft blue (#3B82F6), used sparingly
Text primary:     #0F172A (dark navy)
Text secondary:   #64748B (slate)
Borders:          #E2E8F0, 1px, subtle
Border radius:    14–18px cards, 10–12px buttons
Shadows:          Very light (0 1px 3px rgba(0,0,0,0.05))
```

**Sidebar (logged-in areas only):** Dashboard, Find Doctors, Appointments, AI Symptom Checker, Medical Records — divider — Messages, Notifications — divider — Settings, Help & Support. Keep minimal (~220–240px), never dominant. Landing page uses top navbar only, no sidebar.

---

## 4. Known Issues Fixed

| Issue | Root Cause | Fix |
|---|---|---|
| Settings page dark/light mismatch | Theme inconsistency across screen | Unified to #F8FAFC everywhere |
| Landing headline barely visible | Near-white text on light bg | Changed to #0F172A, enforced WCAG AA check |
| Mismatched serif font on stats | Inconsistent font pairing | Restricted accent font to 1 word only |
| Website login 403 CSRF error | CSRF applied globally incl. login | Exempted auth routes from CSRF |
| Website cookies not saving | `credentials: "omit"` on fetch | Changed to `credentials: "include"` |
| Mobile login silently failing | Backend response missing `token` | Backend now returns `{ user, token }` |
| Google OAuth button not opening | CSP blocking Google script/iframe | Allowed Google domains in script-src, frame-src, connect-src |

---

## 5. Pending / In Progress

- Website responsiveness verification across breakpoints (375px / 768px / 1024px+)
- Landing page fast product-style carousel
- Full manual QA pass (every button/link/toggle functional, contrast re-check across all screens)

---

## 6. Security Checklist Status

| # | Item | Status |
|---|---|---|
| 1 | CORS (origin-restricted) | Done |
| 2 | JWT/Auth (dual token) | Done |
| 3 | RBAC | Done |
| 4 | Input Validation (Zod) | Done |
| 5 | SQL Injection (Prisma ORM) | Done |
| 6 | XSS defense | Verify on symptom checker/chat inputs |
| 7 | CSRF | Done, auth routes exempted |
| 8 | Rate Limiting | Done |
| 9 | Security Headers | Done (CSP updated for Google GSI) |
| 10 | Secrets management | Done |
| 11 | Audit Logs | Done (admin dashboard) |
| 12 | Encryption | Verify at-rest encryption for records |
| 13 | Dependency Security | Verify — run npm audit before deploy |
| 14 | Logging/Monitoring | Verify — not confirmed yet |

---

## 7. Next Priorities (in order)

1. Confirm/fix website responsiveness across breakpoints (375px / 768px / 1024px+)
2. Implement real geolocation location selector (no mock data)
3. Manual QA: click every interactive element + re-check contrast on every screen
4. Landing page product carousel
5. Close remaining security-checklist verification items (XSS, encryption, dependency audit, monitoring)

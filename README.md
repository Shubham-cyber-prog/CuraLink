# CuraLink 🩺

**AI-powered telehealth platform** connecting patients and doctors — with intelligent symptom triage, seamless appointment booking, and real-time consultation chat.

> ⚠️ **Status:** In active development (Semester Project) — currently building core auth & appointment flow.

---

## 🎯 Problem

Patients often struggle to know when a symptom warrants a doctor's visit, and booking a consultation can be slow and disconnected. CuraLink bridges this gap with AI-assisted preliminary guidance and a streamlined booking + communication experience — **without replacing professional medical diagnosis.**

---

## ✨ Features

- 🔐 **Role-based authentication** — separate dashboards for Patients, Doctors, and Admins
- 🤖 **AI Symptom Checker** — describes possible causes and urgency level using Claude API (with mandatory medical disclaimers)
- 📅 **Appointment Booking** — doctors set availability, patients book real-time slots
- 💬 **Real-time Chat** — live patient-doctor messaging before/after appointments (Socket.io)
- 🎥 **Video Consultation** *(planned)* — Twilio-based video calls
- ✅ **Doctor Verification** — admin-approved doctor onboarding flow

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL + Prisma ORM |
| Real-time | Socket.io |
| AI | Claude API (Anthropic) |
| Auth | JWT |
| Deployment | Vercel (frontend), Railway (backend + DB) |
| CI/CD | GitHub Actions |

---

## 🏗️ Architecture

```
[Coming soon — system diagram showing frontend, backend, DB, and AI service interaction]
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- PostgreSQL
- Claude API key

### Installation

```bash
git clone https://github.com/<your-username>/curalink.git
cd curalink
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=your_postgres_connection_string
CLAUDE_API_KEY=your_claude_api_key
JWT_SECRET=your_jwt_secret
```

### Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🧪 Testing

```bash
npm test
```

---

## 🗺️ Roadmap

- [x] Project setup (Next.js + Tailwind + TypeScript)
- [ ] Auth + role-based dashboards
- [ ] Doctor availability & appointment booking
- [ ] AI symptom checker integration
- [ ] Real-time chat
- [ ] Deployment + CI/CD
- [ ] Real user testing & feedback

---

## 🤝 Responsible AI

CuraLink's symptom checker is designed as a **preliminary guidance tool, not a diagnostic system**. Every AI response includes clear disclaimers directing users to consult a licensed physician. Severity flags are conservative by design to avoid discouraging users from seeking real medical care.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

Built by [Subham Nayak ] as a semester full-stack project.

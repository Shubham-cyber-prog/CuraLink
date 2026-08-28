<div align="center">

# 🩺 CuraLink
<img width="2079" height="756" alt="image" src="https://github.com/user-attachments/assets/5dc25e10-c195-4748-aa9b-93075963100b" />


**AI-powered telehealth platform connecting patients and doctors in real time**

*Intelligent symptom triage · Seamless appointment booking · Live consultations*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-black?style=flat-square&logo=socket.io)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📌 Overview

Patients often don't know whether a symptom warrants urgent care, and booking a consultation is slow and fragmented across phone calls, walk-ins, and disconnected systems. **CuraLink** solves this with an AI-assisted symptom triage engine paired with a streamlined booking and real-time communication layer — connecting patients to the right doctor, faster.

---

## 🎥 Demo

<div align="center">

*(Screenshot / GIF walkthrough of symptom checker → booking → chat flow)*

| Symptom Checker | Appointment Booking | Live Chat |
|:---:|:---:|:---:|
| ![placeholder](https://via.placeholder.com/280x180?text=Symptom+Checker) | ![placeholder](https://via.placeholder.com/280x180?text=Booking+Flow) | ![placeholder](https://via.placeholder.com/280x180?text=Live+Chat) |

</div>

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 **Role-based Access** | Isolated dashboards & permissions for Patients, Doctors, and Admins |
| 🤖 **AI Symptom Triage** | Claude-powered analysis returning possible causes, urgency level & clinical disclaimers |
| 📅 **Smart Scheduling** | Doctors define availability windows; patients book conflict-free slots in real time |
| 💬 **Real-time Messaging** | Socket.io-powered chat per appointment, with typing indicators & read receipts |
| ✅ **Doctor Verification** | Admin-gated onboarding to ensure platform trust & credential checks |
| 📊 **Symptom History** | Patients can track past AI assessments over time |
| 🎥 **Video Consultation** *(roadmap)* | Twilio-based in-app video calls |

---

## 🏗️ System Architecture

```mermaid
graph TD
    A[Patient / Doctor Client<br/>Next.js + Tailwind] -->|REST API| B[Backend API<br/>Node.js + Express]
    A -->|WebSocket| C[Socket.io Server<br/>Real-time Chat]
    B --> D[(PostgreSQL<br/>via Prisma ORM)]
    B -->|Symptom Analysis| E[Claude API<br/>Anthropic]
    C --> D
    B --> F[Auth Layer<br/>JWT + Role Middleware]
    A -.->|Deployed on| G[Vercel]
    B -.->|Deployed on| H[Railway]
```

<details>
<summary><b>Data Flow — Symptom Check Request</b></summary>

```mermaid
sequenceDiagram
    participant P as Patient (UI)
    participant API as Backend API
    participant AI as Claude API
    participant DB as PostgreSQL

    P->>API: POST /api/symptoms/analyze { symptoms }
    API->>AI: Structured prompt + safety guardrails
    AI-->>API: Possible causes, severity, disclaimer
    API->>DB: Store symptom_check record
    API-->>P: JSON response with severity flag
    alt High severity
        P->>P: Show "Consult doctor immediately" banner
    end
```

</details>

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="33%">

**Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod

</td>
<td valign="top" width="33%">

**Backend**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Socket.io
- JWT Authentication

</td>
<td valign="top" width="33%">

**Infra & AI**
- Claude API (Anthropic)
- Vercel (frontend hosting)
- Railway (backend + DB)
- GitHub Actions (CI/CD)
- Jest + React Testing Library

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

```
Node.js >= 20.x
PostgreSQL >= 15
npm or pnpm
```

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/curalink.git
cd curalink
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLAUDE_API_KEY` | Anthropic API key for symptom analysis |
| `JWT_SECRET` | Secret for signing auth tokens |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL |

### 3. Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

App runs at `http://localhost:3000`

---

## 🧪 Testing & Quality

```bash
npm test              # Run unit tests
npm run test:coverage # Coverage report
npm run lint          # ESLint check
```

CI pipeline (GitHub Actions) runs lint + tests on every push and pull request. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## 📂 Project Structure

```
curalink/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── (auth)/         # Login, register
│   │   ├── (patient)/      # Patient dashboard, symptom checker, appointments
│   │   ├── (doctor)/       # Doctor dashboard, availability
│   │   └── (admin)/        # Doctor verification panel
│   ├── components/         # Reusable UI components
│   ├── lib/                # API clients, socket setup, utils
│   └── server/
│       ├── routes/         # Express route handlers
│       ├── services/       # Claude API integration, business logic
│       ├── middleware/     # Auth & role guards
│       └── prisma/         # schema.prisma, migrations
├── tests/
├── .github/workflows/
└── README.md
```

---

## 🗺️ Roadmap

- [x] Project scaffolding (Next.js + TypeScript + Tailwind)
- [ ] Authentication & role-based dashboards
- [ ] Doctor availability & booking engine
- [ ] AI symptom checker (Claude integration)
- [ ] Real-time chat (Socket.io)
- [ ] CI/CD pipeline + deployment
- [ ] Video consultations (Twilio)
- [ ] Real-world pilot with local clinic feedback

Track progress in [Issues](../../issues) and [Projects](../../projects).

---

## 🤝 Responsible AI

CuraLink's symptom checker is built as a **preliminary guidance tool — not a diagnostic system**:

- Every response includes a mandatory disclaimer to consult a licensed physician
- Severity classification is intentionally conservative to avoid under-triaging
- No response ever states a definitive diagnosis — only possible causes
- Symptom history is stored securely and never shared without patient consent

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Check the [issues page](../../issues) or open a PR.

```bash
git checkout -b feature/your-feature
git commit -m "Add: your feature description"
git push origin feature/your-feature
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

**Built with ❤️ by Subham Nayak **

[LinkedIn](#) · [Portfolio](#) · [Twitter](#)

</div>

<div align="center">

<img width="2079" height="756" alt="CuraLink banner" src="https://github.com/user-attachments/assets/aa0fb947-53aa-4853-a1e7-adf803160d29" />

# 🩺 CuraLink

**AI-powered telehealth platform connecting patients and doctors in real time**

*Intelligent symptom triage · Seamless appointment booking · Live consultations · Web & Mobile*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-black?style=flat-square&logo=socket.io)](https://socket.io/)
[![Claude API](https://img.shields.io/badge/AI-Claude_API-D97757?style=flat-square)](https://www.anthropic.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/Shubham-cyber-prog/CuraLink/ci.yml?style=flat-square&label=CI)](../../actions)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📌 Overview

Patients often don't know whether a symptom warrants urgent care, and booking a consultation is slow and fragmented across phone calls, walk-ins, and disconnected systems.

**CuraLink** solves this with an AI-assisted symptom triage engine paired with a streamlined booking flow and real-time communication layer — connecting patients to the right doctor, faster. It ships as both a **web app** and a **native mobile app**, sharing a single backend.

> ⚠️ CuraLink's AI provides **preliminary informational guidance only** and is explicitly designed to never replace professional medical diagnosis. See [Responsible AI](#-responsible-ai).

---

## ✨ Key Features

| Feature | Status | Description |
|---|:---:|---|
| 🔐 **Role-based Authentication** | ✅ Live | JWT-based auth with isolated flows for Patients, Doctors, and Admins |
| 📱 **Cross-platform Client** | 🚧 In Progress | Web app (Next.js) + native mobile app (React Native/Expo) sharing one API |
| 🤖 **AI Symptom Triage** | 🚧 In Progress | Claude-powered analysis returning possible causes, urgency level & clinical disclaimers |
| 📅 **Smart Scheduling** | 🚧 In Progress | Doctors define availability windows; patients book conflict-free slots in real time |
| 💬 **Real-time Messaging** | 🔜 Planned | Socket.io-powered chat per appointment, with typing indicators |
| ✅ **Doctor Verification** | 🔜 Planned | Admin-gated onboarding to ensure platform trust |
| 📊 **Symptom History** | 🔜 Planned | Patients can track past AI assessments over time |

---

## 🏗️ Architecture

CuraLink follows a **layered, API-first architecture** — a single backend serves both the web and mobile clients, keeping business logic centralized and consistent across platforms.

### High-Level System Design

```mermaid
graph TB
    subgraph "Client Layer"
        direction LR
        A1["🖥️ Web App<br/>Next.js 15 · TypeScript · Tailwind"]
        A2["📱 Mobile App<br/>React Native · Expo · NativeWind"]
    end

    subgraph "API Gateway"
        LB["⚡ HTTPS / WSS<br/>Load Balancer"]
    end

    subgraph "Application Layer — Node.js"
        direction TB
        AUTH["🔐 Auth Service<br/>JWT · bcrypt · Role Middleware"]
        REST["🌐 REST API<br/>Express Controllers"]
        WS["💬 Socket.io Server<br/>Real-time Chat Rooms"]
        AISVC["🤖 AI Orchestration Service<br/>Prompt Construction · Response Parsing"]
    end

    subgraph "Data Layer"
        PG[("🗄️ PostgreSQL<br/>via Prisma ORM")]
        CACHE[("⚡ Redis<br/>Session & Rate-limit Cache")]
    end

    subgraph "External Services"
        CLAUDE["🧠 Claude API<br/>Anthropic"]
    end

    subgraph "Infrastructure"
        VERCEL["▲ Vercel<br/>Web Hosting + CDN"]
        RAILWAY["🚂 Railway<br/>API + DB Hosting"]
        EAS["📦 EAS Build<br/>Mobile Distribution"]
        GH["⚙️ GitHub Actions<br/>CI/CD Pipeline"]
    end

    A1 -->|HTTPS| LB
    A2 -->|HTTPS| LB
    A1 -.->|WSS| WS
    A2 -.->|WSS| WS

    LB --> REST
    REST --> AUTH
    REST --> AISVC
    AISVC --> CLAUDE
    REST --> PG
    AUTH --> CACHE
    WS --> PG

    A1 -.deployed on.-> VERCEL
    A2 -.built via.-> EAS
    REST -.deployed on.-> RAILWAY
    PG -.hosted on.-> RAILWAY
    GH -.deploys.-> VERCEL
    GH -.deploys.-> RAILWAY

    style A1 fill:#0D9488,color:#fff
    style A2 fill:#0D9488,color:#fff
    style REST fill:#0891B2,color:#fff
    style WS fill:#0891B2,color:#fff
    style AISVC fill:#0891B2,color:#fff
    style CLAUDE fill:#D97757,color:#fff
    style PG fill:#336791,color:#fff
```

---

### Request Lifecycle — Symptom Analysis (end-to-end)

```mermaid
sequenceDiagram
    autonumber
    participant U as Patient
    participant C as Client (Web/Mobile)
    participant MW as Auth Middleware
    participant API as Symptom Controller
    participant SVC as AI Service Layer
    participant AI as Claude API
    participant DB as PostgreSQL

    U->>C: Describes symptoms in form
    C->>MW: POST /api/symptoms/analyze (+ JWT)
    MW->>MW: Verify token, attach user context
    MW->>API: Forward authenticated request
    API->>API: Validate & sanitize input (Zod)
    API->>SVC: analyzeSymptoms(text, patientContext)
    SVC->>SVC: Build structured prompt + safety guardrails
    SVC->>AI: POST /v1/messages
    AI-->>SVC: Structured JSON (causes, severity, disclaimer)
    SVC->>SVC: Parse & validate AI response shape
    SVC->>DB: INSERT symptom_check record
    DB-->>SVC: Confirmation
    SVC-->>API: Formatted result
    API-->>C: 200 OK { causes, severity, disclaimer }
    C->>C: Render results
    alt severity == HIGH
        C->>U: 🔴 "Consult a doctor immediately" banner
    else severity == MODERATE
        C->>U: 🟡 "Consider booking a consultation"
    else severity == LOW
        C->>U: 🟢 Guidance shown with routine care tips
    end
```

---

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant C as Client
    participant API as Auth Controller
    participant DB as PostgreSQL

    rect rgb(240, 253, 250)
    note over U,DB: Registration
    U->>C: Fills registration form
    C->>API: POST /api/auth/register
    API->>API: Hash password (bcrypt, 10 rounds)
    API->>DB: BEGIN TRANSACTION
    API->>DB: Create User row
    API->>DB: Create role-specific profile (Patient/Doctor)
    API->>DB: COMMIT
    DB-->>API: User created
    API-->>C: 201 Created
    end

    rect rgb(240, 253, 250)
    note over U,DB: Login
    U->>C: Enters credentials
    C->>API: POST /api/auth/login
    API->>DB: findUnique(email)
    DB-->>API: User record
    API->>API: bcrypt.compare(password, hash)
    API->>API: jwt.sign({userId, role}, secret, 7d)
    API-->>C: Set-Cookie: token (httpOnly, secure, sameSite)
    end

    rect rgb(254, 249, 240)
    note over U,DB: Protected Route Access
    C->>API: GET /api/patient/dashboard (cookie auto-attached)
    API->>API: Verify JWT signature & expiry
    API->>API: Check role matches route requirement
    alt valid + authorized
        API-->>C: 200 OK + data
    else invalid/expired
        API-->>C: 401 Unauthorized
    else wrong role
        API-->>C: 403 Forbidden
    end
    end
```

---

### Database Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o| DOCTOR : "has profile"
    USER ||--o| PATIENT : "has profile"
    DOCTOR ||--o{ DOCTOR_AVAILABILITY : defines
    DOCTOR ||--o{ APPOINTMENT : receives
    PATIENT ||--o{ APPOINTMENT : books
    PATIENT ||--o{ SYMPTOM_CHECK : requests
    APPOINTMENT ||--o{ CHAT_MESSAGE : contains
    APPOINTMENT ||--o| REVIEW : "rated via"
    DOCTOR ||--o{ REVIEW : receives

    USER {
        string id PK
        string email UK
        string passwordHash
        string name
        enum role
        datetime createdAt
    }
    DOCTOR {
        string id PK
        string userId FK
        string specialization
        int experienceYears
        decimal consultationFee
        boolean verified
    }
    PATIENT {
        string id PK
        string userId FK
        datetime dob
        json medicalHistory
    }
    APPOINTMENT {
        string id PK
        string patientId FK
        string doctorId FK
        datetime slotTime
        enum status
    }
    SYMPTOM_CHECK {
        string id PK
        string patientId FK
        string symptomsText
        json aiAnalysis
        enum severity
    }
    CHAT_MESSAGE {
        string id PK
        string appointmentId FK
        string senderId
        string message
        datetime sentAt
    }
    REVIEW {
        string id PK
        string appointmentId FK
        int rating
    }
```

---

### Deployment Topology

```mermaid
graph LR
    subgraph "Developer"
        DEV["👨‍💻 git push"]
    end

    subgraph "CI/CD — GitHub Actions"
        LINT["Lint & Type Check"]
        TEST["Run Jest Suite"]
        BUILD["Build Artifacts"]
    end

    subgraph "Production — Vercel"
        WEB["Next.js Web App<br/>Edge Network / CDN"]
    end

    subgraph "Production — Railway"
        API["Express API<br/>Container"]
        DBX[("PostgreSQL<br/>Managed Instance")]
    end

    subgraph "Distribution — EAS"
        MOB["Mobile Builds<br/>iOS / Android"]
    end

    DEV --> LINT --> TEST --> BUILD
    BUILD -->|on main| WEB
    BUILD -->|on main| API
    BUILD -->|on tag| MOB
    API <--> DBX
    WEB -->|API calls| API
```

---

### Why These Design Decisions

| Decision | Reasoning |
|---|---|
| **Single backend for web + mobile** | One source of truth for business logic; avoids duplicating validation, auth, and AI-orchestration code across platforms |
| **JWT in httpOnly cookies (web) / SecureStore (mobile)** | Mitigates XSS token theft on web; avoids plaintext storage on device |
| **Service layer between controllers and Claude API** | Isolates prompt engineering and response parsing from HTTP concerns — makes the AI logic independently testable |
| **Prisma transactions for User + Profile creation** | Guarantees atomicity — a user is never left in a half-created state if profile creation fails |
| **Severity-based conditional UI (not just raw text)** | Forces a consistent, conservative safety response across the entire app rather than relying on prompt output alone |

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="25%">

**Web Frontend**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS

</td>
<td valign="top" width="25%">

**Mobile Frontend**
- React Native (Expo)
- Expo Router
- NativeWind

</td>
<td valign="top" width="25%">

**Backend**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Socket.io
- JWT Authentication

</td>
<td valign="top" width="25%">

**Infra & AI**
- Claude API (Anthropic)
- Vercel · Railway
- GitHub Actions (CI/CD)
- Jest

</td>
</tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

```
Node.js >= 20.x
PostgreSQL >= 15
npm
```

### 1. Clone & Install (Web + Backend)

```bash
git clone https://github.com/Shubham-cyber-prog/CuraLink.git
cd CuraLink
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

> 🔐 Keep real credentials in `.env.local` (or deployment secrets manager) only. Never commit production keys or OAuth client secrets.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLAUDE_API_KEY` | Anthropic API key for symptom analysis |
| `JWT_SECRET` | Secret for signing auth tokens |
| `GOOGLE_OAUTH_CLIENT_ID` | Google OAuth web client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Google OAuth web client secret (store securely, never commit) |
| `NEXT_PUBLIC_API_URL` | Base URL for web client API requests |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL |
| `EXPO_PUBLIC_API_URL` | Base URL for mobile client API requests |

### 3. Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Run the Web App

```bash
npm run dev
```

App runs at `http://localhost:3000`

### 5. Run the Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your device.

---

## 🧪 Testing & Quality

```bash
npm test              # Run unit + integration tests
npm run lint           # ESLint check
```

CI pipeline (GitHub Actions) runs lint + tests on every push and pull request. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## 📂 Project Structure

```
CuraLink/
├── app/                     # Next.js App Router (web frontend)
│   ├── login/               ├── register/
│   ├── forgot-password/     └── reset-password/
├── components/
│   └── auth/                # Auth forms, password strength, layout
├── src/                     # Express backend
│   ├── controllers/         ├── services/
│   ├── middleware/          # Auth, role, error handling
│   ├── routes/               ├── validators/
│   └── utils/                # JWT, password hashing, error helpers
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── mobile/                  # React Native (Expo) app
│   └── src/
│       ├── app/              # Expo Router — (auth), (tabs)
│       ├── components/       ├── lib/
├── tests/
│   ├── unit/                 └── integration/
├── .github/workflows/ci.yml
└── README.md
```

---

## 🗺️ Roadmap

- [x] Project scaffolding — Next.js + TypeScript + Tailwind
- [x] Authentication system — register/login, JWT, bcrypt, role-based middleware
- [x] Mobile app scaffolding — Expo Router + NativeWind, matching design system
- [x] CI pipeline — lint + tests on push
- [ ] Doctor availability & booking engine
- [ ] AI symptom checker — Claude integration
- [ ] Real-time chat — Socket.io
- [ ] Deployment — Vercel + Railway + custom domain
- [ ] Real-world pilot with local clinic feedback

Track live progress in [Issues](../../issues).

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

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

**Built by [Subham Nayak](https://github.com/Shubham-cyber-prog)**

</div>

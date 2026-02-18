# Technical Architecture

## 4. Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18+ | UI Framework (functional components, hooks) |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| Lucide React | Icon library |
| Vanilla CSS | Styling (no Tailwind in production) |
| PapaParse | CSV parsing |
| html2pdf.js | PDF generation |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js + Express | API server |
| Prisma ORM | Database access and migrations |
| PostgreSQL | Primary database |
| JWT (jsonwebtoken, bcryptjs) | Authentication |
| CORS | Cross-origin handling |

### Infrastructure

| Service | Environment |
|---------|-------------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Neon/Supabase | PostgreSQL database |

---

## 5. Architecture Overview

```

┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React/Vite)                  │
├─────────────────────────────────────────────────────────────┤
│  Pages          │  Components       │  Context              │
│  - SSEToolkit   │  - sse/           │  - SSEDataContext     │
│  - Dashboard    │  - ui/            │  - SchoolProfileContext│
│  - Login        │  - analysis/      │  - AccessContext      │
│  - Admin        │                   │  - UIConfigContext    │
├─────────────────────────────────────────────────────────────┤
│                         Hooks                               │
│  - useBackendData (CSV loading)                            │
│  - useSSEData (score management)                           │
│  - useBackupRestore (data export/import)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express/Prisma)                 │
├─────────────────────────────────────────────────────────────┤
│  Controllers    │  Services         │  Middleware           │
│  - auth         │  - sseService     │  - authMiddleware     │
│  - sse          │  - authService    │  - roleMiddleware     │
│  - admin        │                   │                       │
│  - config       │                   │                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL)                  │
│  Tables: User, School, SSEScore, SystemConfig              │
└─────────────────────────────────────────────────────────────┘

```

---

## 10. Data Architecture

### CSV Data Files (in /checklists/)

| File | Size | Purpose |
|------|------|---------|
| Backend.csv | ~289KB | Main indicator database (all dimensions) |
| PrincipalDP.csv | ~44KB | Principal checklist data |
| GeneralD.csv | ~33KB | General dimension data |
| LT2Checklist.csv | ~31KB | LT2 checklist items |
| AdminHr.csv | ~25KB | Admin/HR checklist |
| BudgetChecklist.csv | ~23KB | Budget review items |
| OtherStaffs.csv | ~20KB | Other staff checklist |
| LessonObservationFSChecklist.csv | ~17KB | Foundation observation |
| LessonObservationKSChecklist.csv | ~17KB | Key stage observation |
| senLtChecklist.csv | ~14KB | SEN LT items |
| Foundation.csv | ~11KB | Foundation stage items |
| results.csv | ~11KB | Results template |
| LT1Checklist.csv | ~10KB | LT1 checklist items |
| LessonPlanFSChecklist.csv | ~8KB | FS lesson plan items |
| LessonPlanKeyStageChecklist.csv | ~7KB | KS lesson plan items |

### CSV Column Structure

```csv
Strand,SubstrandNo,Substrand,Outcomes,OutcomeScore,Indicators,IndicatorCode,IndicatorScore
```

### Context State Management

| Context | File | Purpose |
|---------|------|---------|
| SSEDataContext | context/SSEDataContext.jsx | Score data CRUD, API sync |
| SchoolProfileContext | context/SchoolProfileContext.jsx | School profile state |
| AccessContext | context/AccessContext.jsx | Module access control |
| UIConfigContext | context/UIConfigContext.jsx | UI configuration |

### Custom Hooks

| Hook | File | Usage |
|------|------|-------|
| useBackendData | hooks/useBackendData.js | Load & parse CSV data |
| useSSEData | (in SSEDataContext) | Score management |
| useBackupRestore | hooks/useBackupRestore.js | Export/import data |

---

## 11. API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/me` | GET | Current user info |

### School Review Scores

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sse-scores` | GET | Get all scores for school |
| `/api/sse-scores` | PUT | Bulk update scores |
| `/api/sse-scores/:code/:dimension` | GET | Get specific indicator |

### Admin

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/schools` | GET | List all schools |
| `/api/admin/schools/:id` | PUT | Update school config |
| `/api/admin/schools/:id` | DELETE | Delete school |
| `/api/admin/users` | GET | List all users |

### Configuration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/config/navigation` | GET | Get nav items |
| `/api/config/navigation` | PUT | Update nav config |

---

## 22. Security & Access Control

> **Purpose:** Protect sensitive school data and ensure proper access controls.

### Authentication Security

| Feature | Implementation |
|---------|----------------|
| **Password Requirements** | Min 8 chars, uppercase, number, special |
| **Two-Factor Auth (2FA)** | TOTP for Admin/SA roles |
| **Session Management** | 24h expiry, single device option |
| **Account Lockout** | 5 failed attempts = 15min lock |

### Role-Based Access Control (RBAC)

| Permission | PRINCIPAL | TEACHER | QAD | SA | ADMIN |
|------------|-----------|---------|-----|-------|-------|
| View own school | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit own school | ✅ | ❌ | ❌ | ❌ | ✅ |
| View all schools | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ✅ |
| System config | ❌ | ❌ | ❌ | ❌ | ✅ |
| Interventions | ❌ | ❌ | ❌ | ✅ | ✅ |

### Data Privacy

| Feature | Description |
|---------|-------------|
| **Data Encryption** | TLS in transit, AES at rest |
| **Data Retention** | Configurable retention periods |
| **Data Export** | GDPR-compliant export |
| **Anonymization** | Remove PII for research |
| **Audit Compliance** | Full audit trail |

### Security API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/2fa/setup` | POST | Enable 2FA |
| `/api/auth/2fa/verify` | POST | Verify 2FA code |
| `/api/auth/sessions` | GET | List active sessions |
| `/api/auth/sessions/:id` | DELETE | Revoke session |
| `/api/security/password` | PUT | Change password |

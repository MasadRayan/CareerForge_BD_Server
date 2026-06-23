# CareerForge BD — Backend Planning Guide

> **Project:** CareerForge BD — AI-Powered Career Roadmap, JD Compatibility & Mock Interview Platform  
> **Role:** Backend Developer (Node.js + Express + TypeScript)  
> **Database:** PostgreSQL via Neon DB + Prisma ORM  
> **Auth:** Firebase Authentication (firebase-admin for server-side verification)  
> **AI:** Google Gemini API (free tier)  
> **Payments:** SSLCommerz (sandbox mode)  
> **Code Execution:** Self-hosted Judge0 on Oracle Cloud Always Free VM  
> **Hosting:** Render (free tier)  
> **SRS Version:** 1.0 — June 2026  

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Technology Stack (Backend)](#2-technology-stack-backend)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema & Entity Relationships](#4-database-schema--entity-relationships)
5. [Middleware Layer](#5-middleware-layer)
6. [API Modules — Detailed Plan](#6-api-modules--detailed-plan)
   - 6.1 [Auth & Users Module](#61-auth--users-module)
   - 6.2 [CV Module](#62-cv-module)
   - 6.3 [Job Descriptions Module](#63-job-descriptions-module)
   - 6.4 [Analysis Module](#64-analysis-module)
   - 6.5 [Roadmap Module](#65-roadmap-module)
   - 6.6 [Quiz Module](#66-quiz-module)
   - 6.7 [Coding Interview Module](#67-coding-interview-module)
   - 6.8 [Behavioral Interview Module](#68-behavioral-interview-module)
   - 6.9 [Readiness Score Module](#69-readiness-score-module)
   - 6.10 [Payments Module](#610-payments-module)
   - 6.11 [Notifications Module](#611-notifications-module)
   - 6.12 [Admin Module](#612-admin-module)
7. [Background Jobs](#7-background-jobs)
8. [REST API Reference](#8-rest-api-reference)
9. [Security Implementation](#9-security-implementation)
10. [Sprint Plan (Backend Focus)](#10-sprint-plan-backend-focus)
11. [Environment Variables](#11-environment-variables)
12. [Testing Strategy](#12-testing-strategy)
13. [Known Limitations & Mitigations](#13-known-limitations--mitigations)
14. [Future Scope (Backend Impact)](#14-future-scope-backend-impact)

---

## 1. Project Architecture Overview

```
[React Frontend — Vercel]
        |
        | Firebase ID Token + Axios
        v
[Express API — Render]
   - helmet, cors, rate-limit
   - firebase-admin token verification middleware
   - RBAC middleware (role check)
        |
        |-----> [CV / JD Analysis Service]       --> [Gemini API]
        |-----> [Roadmap Generator Service]       --> [Gemini API]
        |-----> [Interview Engine]
        |            |-----> [Quiz Logic — internal DB]
        |            |-----> [Code Submission]   --> [Self-hosted Judge0 — Oracle Cloud VM]
        |            |-----> [Behavioral Feedback] --> [Gemini API]
        |-----> [Payment Service]   --> [SSLCommerz Sandbox] --> [Webhook Handler]
        |-----> [Notification Service] --> [Nodemailer / Gmail SMTP]
        |-----> [Admin Service] (RBAC: admin only)
        |
        v
[PostgreSQL — Neon DB] (via Prisma)
```

### Key Design Decisions
- **Firebase handles identity** (passwords, OAuth). Backend never stores raw passwords.
- Every protected route validates the Firebase ID token via `firebase-admin` before any logic runs.
- **PostgreSQL Users table** links to Firebase via `firebase_uid` as the PK — not a password hash.
- **Stateless Express API** — no session state on the server; token is re-verified per request.
- **AI responses are schema-validated** before persisting to DB to guard against malformed Gemini output.
- **Prisma ORM** — parameterized queries only; zero raw SQL concatenation.

---

## 2. Technology Stack (Backend)

| Technology | Purpose |
|---|---|
| Node.js + Express.js + TypeScript | Core API framework with type safety |
| PostgreSQL (Neon DB — free tier) | Primary relational database |
| Prisma ORM | Database access layer and migrations |
| firebase-admin | Server-side Firebase ID token verification |
| Zod | Request body schema validation middleware |
| express-rate-limit | Rate limiting on sensitive and AI endpoints |
| helmet + cors | Security headers and cross-origin configuration |
| multer | Multipart file upload handling (CV files) |
| pdf-parse + mammoth | Text extraction from PDF and DOCX CVs |
| Google Gemini SDK | ATS scoring, gap analysis, roadmap generation, behavioral feedback |
| Judge0 (self-hosted via Docker) | Sandboxed code execution for coding interview |
| SSLCommerz SDK (sandbox) | Payment processing — bKash, Nagad, card |
| node-cron | Scheduled background jobs |
| Nodemailer + Gmail SMTP | Transactional emails |
| winston | Structured application logging |
| swagger-jsdoc + swagger-ui-express | Auto-generated API documentation |
| Jest + Supertest | Unit and integration testing |
| dotenv | Environment variable management |

---

## 3. Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.ts           ← Initialize firebase-admin
│   │   ├── prisma.ts             ← Prisma client singleton
│   │   ├── gemini.ts             ← Gemini SDK initialization
│   │   └── sslcommerz.ts        ← SSLCommerz config
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts        ← Verify Firebase ID token
│   │   ├── rbac.middleware.ts        ← Role-based access control
│   │   ├── rateLimiter.middleware.ts ← express-rate-limit configs
│   │   ├── validate.middleware.ts    ← Zod schema validation
│   │   ├── errorHandler.middleware.ts← Global error handler
│   │   └── quota.middleware.ts       ← Free-tier usage quota check
│   │
│   ├── modules/
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.routes.ts
│   │   ├── cv/
│   │   │   ├── cv.controller.ts
│   │   │   ├── cv.service.ts
│   │   │   ├── cv.parser.ts          ← pdf-parse / mammoth logic
│   │   │   └── cv.routes.ts
│   │   ├── jobDescriptions/
│   │   │   ├── jd.controller.ts
│   │   │   ├── jd.service.ts
│   │   │   └── jd.routes.ts
│   │   ├── analysis/
│   │   │   ├── analysis.controller.ts
│   │   │   ├── analysis.service.ts
│   │   │   ├── analysis.prompts.ts   ← Gemini prompt templates
│   │   │   └── analysis.routes.ts
│   │   ├── roadmap/
│   │   │   ├── roadmap.controller.ts
│   │   │   ├── roadmap.service.ts
│   │   │   └── roadmap.routes.ts
│   │   ├── quiz/
│   │   │   ├── quiz.controller.ts
│   │   │   ├── quiz.service.ts
│   │   │   └── quiz.routes.ts
│   │   ├── coding/
│   │   │   ├── coding.controller.ts
│   │   │   ├── judge0.service.ts
│   │   │   └── coding.routes.ts
│   │   ├── behavioral/
│   │   │   ├── behavioral.controller.ts
│   │   │   ├── behavioral.service.ts
│   │   │   └── behavioral.routes.ts
│   │   ├── readiness/
│   │   │   ├── readiness.controller.ts
│   │   │   ├── readiness.service.ts
│   │   │   └── readiness.routes.ts
│   │   ├── payments/
│   │   │   ├── payments.controller.ts
│   │   │   ├── sslcommerz.service.ts
│   │   │   └── payments.routes.ts
│   │   ├── notifications/
│   │   │   ├── email.service.ts
│   │   │   └── templates/
│   │   │       ├── receipt.html
│   │   │       ├── reminder.html
│   │   │       └── expiry.html
│   │   └── admin/
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts
│   │       └── admin.routes.ts
│   │
│   ├── jobs/
│   │   ├── streakReset.job.ts        ← Daily streak reset cron
│   │   └── subscriptionExpiry.job.ts ← Daily subscription check cron
│   │
│   ├── utils/
│   │   ├── logger.ts                 ← Winston logger
│   │   └── apiResponse.ts            ← Standardized response helpers
│   │
│   ├── docs/
│   │   └── swagger.ts                ← Swagger/OpenAPI setup
│   │
│   ├── app.ts                        ← Express app, middleware stack, route mounting
│   └── server.ts                     ← HTTP server entry point
│
├── prisma/
│   ├── schema.prisma                 ← Full database schema
│   └── migrations/                   ← Auto-generated migration files
│
├── tests/
│   ├── unit/                         ← Service-layer unit tests
│   └── integration/                  ← Route integration tests (Supertest)
│
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 4. Database Schema & Entity Relationships

### 4.1 Users
```prisma
model Users {
  id               String   @id              // Firebase UID
  email            String   @unique
  name             String
  role             Role     @default(free_user)  // free_user | premium_user | admin
  target_role      String?
  experience_level String?
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  // Relations
  subscriptions    Subscriptions[]
  transactions     Transactions[]
  cvs              CVs[]
  jobDescriptions  JobDescriptions[]
  roadmaps         Roadmaps[]
  streaks          Streaks?
  quizAttempts     QuizAttempts[]
  codeSubmissions  CodeSubmissions[]
  behavioralAnswers BehavioralAnswers[]
  readinessScores  ReadinessScores[]
  usageQuota       UsageQuotas?
  reportedIssues   ReportedIssues[]
}
enum Role { free_user premium_user admin }
```

### 4.2 Subscriptions
```prisma
model Subscriptions {
  id          String   @id @default(uuid())
  user_id     String
  plan        Plan     // free | premium
  status      SubStatus // active | expired | cancelled
  started_at  DateTime
  expires_at  DateTime
  user        Users    @relation(fields: [user_id], references: [id])
  transactions Transactions[]
}
enum Plan { free premium }
enum SubStatus { active expired cancelled }
```

### 4.3 Transactions
```prisma
model Transactions {
  id                     String   @id @default(uuid())
  user_id                String
  subscription_id        String
  amount                 Decimal
  currency               String
  gateway                String   // "sslcommerz"
  gateway_transaction_id String
  status                 TxStatus // pending | success | failed | refunded
  created_at             DateTime @default(now())
}
enum TxStatus { pending success failed refunded }
```

### 4.4 CVs
```prisma
model CVs {
  id             String   @id @default(uuid())
  user_id        String
  version_number Int
  file_url       String
  raw_text       String   @db.Text
  uploaded_at    DateTime @default(now())
  analyses       Analyses[]
}
```

### 4.5 JobDescriptions
```prisma
model JobDescriptions {
  id         String   @id @default(uuid())
  user_id    String
  title      String
  raw_text   String   @db.Text
  created_at DateTime @default(now())
  analyses   Analyses[]
}
```

### 4.6 Analyses *(junction entity with attributes)*
```prisma
model Analyses {
  id                      String   @id @default(uuid())
  cv_id                   String
  jd_id                   String
  ats_score               Int
  keyword_match_breakdown Json     // { matched: [], missing: [], score_per_category: {} }
  gap_skills              Json     // String[]
  rewrite_suggestions     Json     // { original: string, suggested: string }[]
  created_at              DateTime @default(now())
  roadmaps                Roadmaps[]
}
```

### 4.7 Roadmaps
```prisma
model Roadmaps {
  id             String       @id @default(uuid())
  analysis_id    String
  user_id        String
  duration_weeks Int
  status         RoadmapStatus // active | completed | abandoned
  created_at     DateTime     @default(now())
  weeks          RoadmapWeeks[]
}
enum RoadmapStatus { active completed abandoned }
```

### 4.8 RoadmapWeeks
```prisma
model RoadmapWeeks {
  id            String     @id @default(uuid())
  roadmap_id    String
  week_number   Int
  topic_summary String
  resources     Resources[]
  dailyTasks    DailyTasks[]
}
```

### 4.9 Resources
```prisma
model Resources {
  id               String       @id @default(uuid())
  roadmap_week_id  String
  title            String
  url              String
  type             ResourceType // video | article | docs | course
}
enum ResourceType { video article docs course }
```

### 4.10 DailyTasks
```prisma
model DailyTasks {
  id               String    @id @default(uuid())
  roadmap_week_id  String
  description      String
  is_completed     Boolean   @default(false)
  completed_at     DateTime?
}
```

### 4.11 Streaks
```prisma
model Streaks {
  id               String @id @default(uuid())
  user_id          String @unique
  current_streak   Int    @default(0)
  longest_streak   Int    @default(0)
  last_active_date DateTime
}
```

### 4.12 QuizQuestions & QuizAttempts
```prisma
model QuizQuestions {
  id            String     @id @default(uuid())
  role_category String
  question_text String
  options       Json       // { a: string, b: string, c: string, d: string }
  correct_answer String
  difficulty    Difficulty // easy | medium | hard
  attempts      QuizAttempts[]
}

model QuizAttempts {
  id              String @id @default(uuid())
  user_id         String
  question_id     String
  selected_answer String
  is_correct      Boolean
  attempted_at    DateTime @default(now())
}
enum Difficulty { easy medium hard }
```

### 4.13 CodingProblems & CodeSubmissions
```prisma
model CodingProblems {
  id          String     @id @default(uuid())
  title       String
  description String     @db.Text
  difficulty  Difficulty
  test_cases  Json       // { input: string, expected_output: string }[]
  submissions CodeSubmissions[]
}

model CodeSubmissions {
  id              String     @id @default(uuid())
  user_id         String
  problem_id      String
  code            String     @db.Text
  language        String
  judge0_token    String?
  status          JudgeStatus // pending | accepted | wrong_answer | runtime_error | time_limit
  submitted_at    DateTime @default(now())
}
enum JudgeStatus { pending accepted wrong_answer runtime_error time_limit_exceeded }
```

### 4.14 BehavioralQuestions & BehavioralAnswers
```prisma
model BehavioralQuestions {
  id            String @id @default(uuid())
  question_text String
  category      String
  answers       BehavioralAnswers[]
}

model BehavioralAnswers {
  id          String   @id @default(uuid())
  user_id     String
  question_id String
  answer_text String   @db.Text
  ai_feedback Json?    // { structure_score: int, star_adherence: string, suggestions: string[] }
  answered_at DateTime @default(now())
}
```

### 4.15 ReadinessScores
```prisma
model ReadinessScores {
  id                 String   @id @default(uuid())
  user_id            String
  ats_component      Int      // 0–100
  roadmap_component  Int      // 0–100
  interview_component Int     // 0–100
  composite_score    Int      // weighted average
  calculated_at      DateTime @default(now())
}
```

### 4.16 UsageQuotas
```prisma
model UsageQuotas {
  id                      String   @id @default(uuid())
  user_id                 String   @unique
  analyses_used_this_month Int     @default(0)
  reset_date              DateTime
}
```

### 4.17 SystemLogs
```prisma
model SystemLogs {
  id         String     @id @default(uuid())
  type       LogType    // error | ai_failure | judge0_failure
  message    String
  metadata   Json?
  created_at DateTime   @default(now())
}
enum LogType { error ai_failure judge0_failure }
```

### 4.18 ReportedIssues
```prisma
model ReportedIssues {
  id          String      @id @default(uuid())
  user_id     String
  type        IssueType   // bad_ai_output | bug | other
  description String      @db.Text
  status      IssueStatus // open | in_review | resolved
  created_at  DateTime    @default(now())
}
enum IssueType { bad_ai_output bug other }
enum IssueStatus { open in_review resolved }
```

### 4.19 ER Relationship Summary
```
Users ──< Subscriptions ──< Transactions
Users ──< CVs ──< Analyses >── JobDescriptions ──< Users
Users ──< Roadmaps ──< RoadmapWeeks ──< Resources
                                    ──< DailyTasks
Users ──| Streaks
Users ──| UsageQuotas
Users ──< QuizAttempts >── QuizQuestions
Users ──< CodeSubmissions >── CodingProblems
Users ──< BehavioralAnswers >── BehavioralQuestions
Users ──< ReadinessScores
Users ──< ReportedIssues
SystemLogs (standalone — not FK-linked to Users)
```

---

## 5. Middleware Layer

### 5.1 `auth.middleware.ts`
- Extracts Bearer token from `Authorization` header.
- Verifies token via `firebase-admin.auth().verifyIdToken(token)`.
- Attaches decoded `uid` and `email` to `req.user`.
- Returns `401` if missing or invalid.

### 5.2 `rbac.middleware.ts`
- Receives a required role as a parameter (e.g., `requireRole('admin')`).
- Queries the `Users` table for the `uid` from `req.user`.
- Returns `403` if the user's role doesn't match.

### 5.3 `quota.middleware.ts`
- Checks `UsageQuotas` for the current user.
- If `role === 'free_user'` and `analyses_used_this_month >= FREE_TIER_LIMIT` (e.g., 5), returns `429`.
- Applied only to AI-backed analysis routes.

### 5.4 `rateLimiter.middleware.ts`
- Auth endpoints: 10 requests/minute/IP.
- AI endpoints: 20 requests/minute/user.
- Payment endpoints: 5 requests/minute/user.

### 5.5 `validate.middleware.ts`
- Generic middleware accepting a Zod schema.
- Validates `req.body` against the schema; returns `422` with error details on failure.

### 5.6 `errorHandler.middleware.ts`
- Global Express error handler (4-argument signature).
- Logs errors via Winston, writes to `SystemLogs` table for AI/Judge0 failures.
- Returns standardized `{ success: false, message, errors? }` JSON responses.

---

## 6. API Modules — Detailed Plan

### 6.1 Auth & Users Module

**Routes:** `/api/auth` and `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/sync` | Token | Upsert user in PostgreSQL on first Firebase login |
| GET | `/api/users/me` | Token | Fetch own profile |
| PATCH | `/api/users/me` | Token | Update name, target_role, experience_level |
| DELETE | `/api/users/me` | Token | Delete account + cascade all user data + CV files |

**Service Logic:**
- `auth/sync`: `prisma.users.upsert({ where: { id: uid }, create: {...}, update: {} })` — idempotent, safe to call on every login.
- `DELETE /users/me`: Must delete CVs from file storage, then cascade-delete DB records in correct order to avoid FK constraint violations.

**Zod Schemas:**
```ts
// PATCH /users/me
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  target_role: z.string().max(100).optional(),
  experience_level: z.enum(['entry', 'mid', 'senior']).optional(),
});
```

---

### 6.2 CV Module

**Routes:** `/api/cv`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/cv` | Token | Upload CV (multipart/form-data, max 5 MB) |
| GET | `/api/cv` | Token | List own CV versions |
| GET | `/api/cv/:id` | Token | Get specific CV metadata |

**Service Logic (`cv.service.ts`):**
1. Receive file via multer (memory storage or disk).
2. Validate: PDF or DOCX only, max 5 MB.
3. Upload to file storage (e.g., Cloudinary free tier or Render disk) — store `file_url`.
4. Extract text via `cv.parser.ts`:
   - `.pdf` → `pdf-parse(buffer)`
   - `.docx` → `mammoth.extractRawText({ buffer })`
5. Auto-increment `version_number` per user.
6. Persist `CVs` record with `raw_text` and `file_url`.

**`cv.parser.ts`:**
```ts
export async function parseCVText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error('Unsupported file type');
}
```

---

### 6.3 Job Descriptions Module

**Routes:** `/api/jd`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/jd` | Token | Submit a job description text (max 10,000 chars) |
| GET | `/api/jd` | Token | List own job descriptions |

**Zod Schema:**
```ts
const submitJDSchema = z.object({
  title: z.string().min(1).max(200),
  raw_text: z.string().min(50).max(10000),
});
```

---

### 6.4 Analysis Module

**Routes:** `/api/analysis`

| Method | Path | Auth | Middleware | Description |
|---|---|---|---|---|
| POST | `/api/analysis` | Token | quota | Run ATS analysis (calls Gemini) |
| GET | `/api/analysis/:id` | Token | — | Get analysis result |
| GET | `/api/analysis` | Token | — | List own analysis history |

**Gemini Prompt Template (`analysis.prompts.ts`):**
```ts
export const atsAnalysisPrompt = (cvText: string, jdText: string) => `
You are an expert ATS (Applicant Tracking System) analyzer.

Given the following CV and Job Description, return a JSON object with this exact schema:
{
  "ats_score": <integer 0-100>,
  "keyword_match_breakdown": {
    "matched_keywords": [<string>],
    "missing_keywords": [<string>],
    "formatting_issues": [<string>],
    "missing_sections": [<string>]
  },
  "gap_skills": [<string>],
  "rewrite_suggestions": [
    { "original": <string>, "suggested": <string>, "explanation": <string> }
  ]
}

CV TEXT:
${cvText}

JOB DESCRIPTION:
${jdText}

Return ONLY valid JSON. No explanation text.
`;
```

**Service Flow:**
1. Validate `cv_id` and `jd_id` belong to the requesting user.
2. Fetch `raw_text` from both records.
3. Check `UsageQuotas` (quota middleware handles this).
4. Call Gemini API with the analysis prompt.
5. Parse and **validate the JSON response against a Zod schema** — reject if malformed.
6. Persist `Analyses` record.
7. Increment `UsageQuotas.analyses_used_this_month`.
8. Return the full analysis object.

**Roadmap Generation Prompt:**
```ts
export const roadmapPrompt = (gapSkills: string[], durationWeeks: number) => `
You are a senior engineering career coach.

Given these skill gaps and a ${durationWeeks}-week preparation window, generate a structured learning roadmap.

Return a JSON object with this exact schema:
{
  "weeks": [
    {
      "week_number": <int>,
      "topic_summary": <string>,
      "resources": [
        { "title": <string>, "url": <string>, "type": "video"|"article"|"docs"|"course" }
      ],
      "daily_tasks": [<string>, <string>, <string>, <string>, <string>, <string>, <string>]
    }
  ]
}

Skill gaps to address: ${JSON.stringify(gapSkills)}
Duration: ${durationWeeks} weeks

Return ONLY valid JSON. No explanation text.
`;
```

---

### 6.5 Roadmap Module

**Routes:** `/api/roadmap`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/roadmap` | Token | Generate roadmap from `analysis_id` + `duration_weeks` |
| GET | `/api/roadmap/:id` | Token | Get roadmap with all weeks, tasks, and resources |
| PATCH | `/api/roadmap/:id/tasks/:taskId` | Token | Mark a daily task complete |

**Service Logic:**
- On task completion: set `DailyTasks.is_completed = true`, `completed_at = now()`.
- After each task completion, call streak update logic:
  - If `last_active_date` was yesterday → increment `current_streak`.
  - If today → no change (already counted).
  - If gap > 1 day → reset `current_streak` to 1.
  - Update `longest_streak` if `current_streak > longest_streak`.

---

### 6.6 Quiz Module

**Routes:** `/api/quiz`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/quiz` | Token | Fetch quiz questions filtered by `role_category` and `difficulty` |
| POST | `/api/quiz/attempt` | Token | Submit an answer, get is_correct back |

**Note:** Quiz questions are pre-seeded into the `QuizQuestions` table (not AI-generated per request). The backend needs a **seeder script** to populate questions by role category.

**Zod Schema:**
```ts
const quizAttemptSchema = z.object({
  question_id: z.string().uuid(),
  selected_answer: z.enum(['a', 'b', 'c', 'd']),
});
```

---

### 6.7 Coding Interview Module

**Routes:** `/api/coding-problems`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/coding-problems` | Token | List coding problems |
| POST | `/api/coding-problems/:id/submit` | Token | Submit code → Judge0 → return result |

**Judge0 Integration (`judge0.service.ts`):**
```
Flow:
1. POST to Judge0 /submissions with: source_code, language_id, stdin (test case input)
2. Receive submission token
3. Poll GET /submissions/:token until status is not "processing"
4. Compare stdout to expected_output
5. Return { status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded' }
```

**Note:** Judge0 will be self-hosted on **Oracle Cloud Always Free VM** using Docker. The backend connects to it via its public IP.

---

### 6.8 Behavioral Interview Module

**Routes:** `/api/behavioral-questions`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/behavioral-questions` | Token | Fetch behavioral questions |
| POST | `/api/behavioral-questions/:id/answer` | Token | Submit answer → Gemini feedback |

**Gemini Feedback Prompt:**
```ts
export const behavioralFeedbackPrompt = (question: string, answer: string) => `
You are an experienced HR interviewer evaluating a candidate's behavioral interview answer.

Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate using the STAR method (Situation, Task, Action, Result) and return:
{
  "structure_score": <int 0-10>,
  "star_adherence": <"excellent"|"good"|"needs_improvement">,
  "strengths": [<string>],
  "suggestions": [<string>],
  "improved_example": <string>
}

Return ONLY valid JSON.
`;
```

---

### 6.9 Readiness Score Module

**Routes:** `/api/readiness-score`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/readiness-score` | Token | Calculate and return composite readiness score |

**Calculation Logic:**
```
ats_component      = latest Analyses.ats_score for the user (0–100)
roadmap_component  = (completed DailyTasks / total DailyTasks) × 100 across active roadmap
interview_component = average of:
                      - quiz accuracy % (correct attempts / total attempts × 100)
                      - coding acceptance % (accepted submissions / total × 100)
                      - behavioral avg structure_score / 10 × 100

composite_score = (ats_component × 0.35) + (roadmap_component × 0.35) + (interview_component × 0.30)
```

Persist result to `ReadinessScores` on each calculation.

---

### 6.10 Payments Module

**Routes:** `/api/payments`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/init` | Token | Initiate SSLCommerz sandbox session |
| POST | `/api/payments/webhook` | **None (public)** | SSLCommerz IPN callback handler |
| GET | `/api/payments/history` | Token | User's own transaction history |

**SSLCommerz Flow:**
```
1. POST /api/payments/init
   → Create pending Transaction record
   → Call SSLCommerz API to get GatewayPageURL
   → Return { gateway_url } to frontend (frontend redirects user)

2. User pays on SSLCommerz's hosted page

3. SSLCommerz sends IPN (Instant Payment Notification) to POST /api/payments/webhook
   → Validate IPN signature
   → Update Transaction status → 'success' or 'failed'
   → If success: upsert Subscription (status: active, set expires_at)
   → Update user role to 'premium_user'
   → Send email receipt via email.service.ts
```

**Security:** The webhook endpoint must **not** require Firebase auth (called by SSLCommerz server), but must **validate the SSLCommerz IPN hash** to prevent spoofing.

---

### 6.11 Notifications Module

**`email.service.ts`** (Nodemailer + Gmail SMTP):
```ts
// Three transactional email types:
sendPaymentReceipt(user, transaction)    // Triggered: successful payment
sendStudyReminder(user)                  // Triggered: daily cron (if streak at risk)
sendSubscriptionExpiry(user, daysLeft)   // Triggered: 7 days and 1 day before expiry
```

HTML templates stored in `modules/notifications/templates/`.

---

### 6.12 Admin Module

**Routes:** `/api/admin` — All routes require `requireRole('admin')`

| Method | Path | Description |
|---|---|---|
| GET | `/api/admin/users` | Paginated list of all users with subscription status |
| GET | `/api/admin/transactions` | All transactions with filters (status, date range) |
| GET | `/api/admin/analytics` | MRR, conversion rate, churn, new signups |
| GET | `/api/admin/usage` | AI call count per user this month |
| GET | `/api/admin/issues` | All reported issues |
| PATCH | `/api/admin/issues/:id` | Update issue status (`open → in_review → resolved`) |
| GET | `/api/admin/logs` | System logs with type filter |

**Analytics Calculation (`admin.service.ts`):**
```
MRR            = SUM of successful transactions this month
Conversion rate = (premium_users / total_users) × 100
Churn          = (subscriptions with status='expired' this month) / (active subscriptions last month) × 100
```

---

## 7. Background Jobs

### 7.1 `streakReset.job.ts`
- **Schedule:** Daily at midnight (`0 0 * * *`).
- **Logic:** For every `Streaks` record where `last_active_date < today - 1 day`, reset `current_streak` to 0.

### 7.2 `subscriptionExpiry.job.ts`
- **Schedule:** Daily at 6 AM (`0 6 * * *`).
- **Logic:**
  1. Find subscriptions where `expires_at <= now` and `status = 'active'` → set `status = 'expired'`, downgrade user `role = 'free_user'`.
  2. Find subscriptions expiring in exactly 7 days → send expiry warning email.
  3. Find subscriptions expiring in exactly 1 day → send final expiry email.

---

## 8. REST API Reference

> All planned backend endpoints are listed below. Protected routes require `Authorization: Bearer <firebase_id_token>`, unless otherwise noted.

### Public / System Endpoints
```
GET    /health                             → Health check for uptime/status
GET    /api-docs                           → Swagger/OpenAPI UI
POST   /api/payments/webhook               → SSLCommerz IPN callback (public)
```

### Auth & Users
```
POST   /api/auth/sync                      → Upsert user on first Firebase login
GET    /api/users/me                       → Fetch current user profile
PATCH  /api/users/me                       → Update profile fields
DELETE /api/users/me                       → Delete account and all associated user data
```

### CV Module
```
POST   /api/cv                             → Upload CV file (PDF or DOCX)
GET    /api/cv                             → List current user's CV versions
GET    /api/cv/:id                         → Get CV metadata and parsed text summary
DELETE /api/cv/:id                         → Delete a CV version
```

### Job Descriptions Module
```
POST   /api/jd                             → Submit a job description text
GET    /api/jd                             → List current user's job descriptions
GET    /api/jd/:id                         → Get job description details
DELETE /api/jd/:id                         → Delete a job description
```

### Analysis Module
```
POST   /api/analysis                       → Run ATS analysis for CV + JD [quota guarded]
GET    /api/analysis                       → List current user's analyses
GET    /api/analysis/:id                   → Get analysis details
DELETE /api/analysis/:id                   → Delete an analysis record
```

### Roadmap Module
```
POST   /api/roadmap                        → Generate roadmap from analysis and duration
GET    /api/roadmap                        → List current user's roadmaps
GET    /api/roadmap/:id                    → Get roadmap with weeks, resources, and tasks
PATCH  /api/roadmap/:id/tasks/:taskId      → Mark roadmap task complete
PATCH  /api/roadmap/:id                   → Update roadmap status or metadata
DELETE /api/roadmap/:id                   → Delete a roadmap
```

### Quiz Module
```
GET    /api/quiz                           → Fetch quiz questions by category and difficulty
POST   /api/quiz/attempt                   → Submit a quiz answer and get correctness
GET    /api/quiz/history                   → List user's quiz attempt history
```

### Coding Interview Module
```
GET    /api/coding-problems                → List available coding problems
GET    /api/coding-problems/:id            → Get coding problem details
POST   /api/coding-problems/:id/submit     → Submit code to Judge0 for evaluation
GET    /api/coding-problems/:id/submissions→ List user's submissions for a problem
```

### Behavioral Interview Module
```
GET    /api/behavioral-questions           → Fetch behavioral interview questions
GET    /api/behavioral-questions/:id       → Get a single behavioral question
POST   /api/behavioral-questions/:id/answer→ Submit answer, receive Gemini feedback
GET    /api/behavioral-answers             → List user's behavioral answers and feedback
```

### Readiness Score Module
```
GET    /api/readiness-score                → Calculate and return composite readiness score
GET    /api/readiness-history             → List past readiness score records
```

### Payments Module
```
POST   /api/payments/init                  → Initiate SSLCommerz payment session
POST   /api/payments/webhook               → SSLCommerz IPN callback handler (public)
GET    /api/payments/history               → Get user's transaction history
GET    /api/payments/subscriptions         → List user's subscription records
GET    /api/payments/status/:transactionId → Get transaction status
```

### Notifications / Emails
```
POST   /api/notifications/reminder         → Trigger a study reminder email (admin/test)
POST   /api/notifications/expiry           → Trigger a subscription expiry email (admin/test)
```

### Admin (role: admin required)
```
GET    /api/admin/users                    → Paginated list of users
GET    /api/admin/transactions             → All transactions with filters
GET    /api/admin/analytics                → Revenue and user analytics
GET    /api/admin/usage                    → AI usage and quota analytics
GET    /api/admin/issues                   → List reported issues
PATCH  /api/admin/issues/:id               → Update issue status
GET    /api/admin/logs                     → System logs with filtering
POST   /api/admin/maintenance              → Trigger admin maintenance task
```

---
---

## 9. Security Implementation

| Requirement | Implementation |
|---|---|
| JWT Authentication | Firebase ID tokens verified server-side via `firebase-admin` on every protected route |
| Password Hashing | Fully delegated to Firebase — no custom password storage |
| Input Validation | Zod schemas applied via `validate.middleware.ts` on all endpoints |
| SQL Injection Protection | Prisma ORM parameterized queries — zero raw SQL concatenation |
| Rate Limiting | `express-rate-limit` on auth (10/min/IP), AI (20/min/user), payment (5/min/user) endpoints |
| CORS | Restricted to deployed frontend origin only |
| Authorization (RBAC) | Role field on Users enforced via `rbac.middleware.ts` |
| Data Privacy | Account deletion removes all PII and CV files |
| Payment Webhook Security | SSLCommerz IPN hash validation before processing |
| Security Headers | `helmet` middleware — sets X-Frame-Options, Content-Security-Policy, etc. |
| AI Output Validation | Gemini JSON responses validated against Zod schemas before DB persistence |

---

## 10. Sprint Plan (Backend Focus)

### ✅ Sprint 1 — Foundation (Weeks 1–2)

**Goal:** Working skeleton with auth, DB, and file upload — everything deployed end-to-end.

- [ ] Initialize Node.js + Express + TypeScript project
- [ ] Setup `tsconfig.json`, `eslint`, `prettier`
- [ ] Install all dependencies (see Section 2)
- [ ] Create folder structure (see Section 3)
- [ ] Setup `config/firebase.ts` — initialize `firebase-admin`
- [ ] Setup `config/prisma.ts` — Prisma client singleton
- [ ] Write `prisma/schema.prisma` — all models and enums
- [ ] Run `prisma migrate dev` against Neon DB
- [ ] Implement `auth.middleware.ts` — Firebase token verification
- [ ] Implement `apiResponse.ts` utility helpers
- [ ] Implement `logger.ts` (Winston)
- [ ] Implement `errorHandler.middleware.ts`
- [ ] Implement `validate.middleware.ts` (Zod wrapper)
- [ ] Build **Users module**: `auth/sync`, `GET /me`, `PATCH /me`, `DELETE /me`
- [ ] Build **CV module**: upload (multer), parse (pdf-parse + mammoth), version tracking
- [ ] Build **Job Descriptions module**: submit and list
- [ ] Setup `app.ts` and `server.ts`
- [ ] Apply `helmet` and `cors` global middleware
- [ ] Deploy to **Render** (backend) + connect to **Neon DB**
- [ ] Verify end-to-end: frontend can call `POST /api/auth/sync` and get user back

---

### 🔬 Sprint 2 — Core AI Analysis (Weeks 3–4)

**Goal:** Fully working ATS analysis + roadmap generation via Gemini.

- [ ] Setup `config/gemini.ts` — Gemini SDK client
- [ ] Write Gemini prompt templates in `analysis.prompts.ts`
- [ ] Implement `quota.middleware.ts` — free-tier limit enforcement
- [ ] Implement `rateLimiter.middleware.ts` — per-endpoint rate limits
- [ ] Build **Analysis module**: `POST /analysis` (Gemini call + schema validation + persist)
- [ ] Build `GET /analysis/:id` and `GET /analysis` (list)
- [ ] Increment `UsageQuotas` on successful analysis
- [ ] Write roadmap generation prompt (Gemini, structured JSON)
- [ ] Build **Roadmap module**: `POST /roadmap` (Gemini call, persist weeks/tasks/resources)
- [ ] Build `GET /roadmap/:id` (full nested response)
- [ ] Build `PATCH /roadmap/:id/tasks/:taskId` (task completion + streak update)
- [ ] Build **Streaks logic** inside roadmap service
- [ ] Seed `QuizQuestions` table with initial question bank per role category
- [ ] Write unit tests for analysis and roadmap services

---

### 🎯 Sprint 3 — Interview Preparation Module (Weeks 5–6)

**Goal:** Full interview suite working — quiz, coding, behavioral, readiness score.

- [ ] Build **Quiz module**: `GET /quiz` (filter by role/difficulty), `POST /quiz/attempt`
- [ ] Setup **Judge0** on Oracle Cloud VM (Docker)
- [ ] Implement `judge0.service.ts` — submission flow + polling
- [ ] Build **Coding module**: `GET /coding-problems`, `POST /coding-problems/:id/submit`
- [ ] Seed `CodingProblems` table with initial problem set
- [ ] Write behavioral feedback Gemini prompt
- [ ] Build **Behavioral module**: `GET /behavioral-questions`, `POST /:id/answer`
- [ ] Seed `BehavioralQuestions` table
- [ ] Build **Readiness Score module**: calculation logic + persist + `GET /readiness-score`
- [ ] Setup **Notifications module**: Nodemailer + Gmail SMTP
- [ ] Implement `sendPaymentReceipt`, `sendStudyReminder`, `sendSubscriptionExpiry`
- [ ] Create email HTML templates
- [ ] Implement `streakReset.job.ts` (node-cron daily midnight)
- [ ] Write integration tests for interview endpoints

---

### 💳 Sprint 4 — Payments, Admin, Polish (Weeks 7–8)

**Goal:** Payments working, admin dashboard complete, test coverage at 70%+, Swagger docs finalized.

- [ ] Setup `config/sslcommerz.ts` — SSLCommerz SDK config
- [ ] Build **Payments module**: `POST /payments/init` (create session, pending tx)
- [ ] Build `POST /payments/webhook` (IPN validation, upgrade user, send receipt)
- [ ] Build `GET /payments/history`
- [ ] Implement `subscriptionExpiry.job.ts` (daily cron — expire subs + downgrade roles + emails)
- [ ] Build **Admin module**: all 7 admin endpoints
- [ ] Implement analytics calculation (MRR, conversion rate, churn)
- [ ] Finalize `rbac.middleware.ts` across all admin routes
- [ ] Setup **Swagger** (`docs/swagger.ts` + all endpoint JSDoc annotations)
- [ ] Push test coverage to **70–80%** (Jest + Supertest)
- [ ] Run full integration test suite against staging DB
- [ ] Deployment hardening: env validation, graceful shutdown, health check endpoint (`GET /health`)
- [ ] Update `README.md` with setup instructions and sandbox payment notes
---

## 11. Environment Variables

Create `.env` (from `.env.example`):

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Neon DB)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Judge0 (self-hosted)
JUDGE0_URL=http://your_oracle_vm_ip:2358

# SSLCommerz (sandbox)
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false

# Email (Gmail SMTP)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# CORS
ALLOWED_ORIGIN=https://your-frontend.vercel.app

# Quotas
FREE_TIER_ANALYSIS_LIMIT=5
```

---

## 12. Testing Strategy

**Framework:** Jest + Supertest  
**Target Coverage:** ≥ 70% (targeting 80%+)

### Unit Tests (`tests/unit/`)
- `analysis.service.test.ts` — Mock Gemini; test schema validation, quota increment
- `cv.parser.test.ts` — Test PDF and DOCX parsing with mock buffers
- `roadmap.service.test.ts` — Mock Gemini; test week/task persistence
- `streak.logic.test.ts` — Test all streak calculation branches
- `readiness.service.test.ts` — Test composite score formula
- `sslcommerz.service.test.ts` — Mock SSLCommerz; test IPN validation logic
- `admin.service.test.ts` — Test MRR/churn/conversion calculations

### Integration Tests (`tests/integration/`)
- `auth.test.ts` — `POST /auth/sync`, `GET /users/me`, `PATCH /me`, `DELETE /me`
- `cv.test.ts` — File upload, text extraction, version increment
- `analysis.test.ts` — Full analysis flow with mocked Gemini
- `roadmap.test.ts` — Roadmap generation + task completion
- `quiz.test.ts` — Fetch questions, submit attempts
- `coding.test.ts` — Submit code with mocked Judge0
- `payments.test.ts` — Init payment, simulate webhook
- `admin.test.ts` — Admin endpoints with role enforcement

---

## 13. Known Limitations & Mitigations

| Limitation | Cause | Mitigation |
|---|---|---|
| Neon DB cold-start (~2–5s) | Free tier auto-suspends after inactivity | Send warm-up query before demo |
| Render cold-start (30–50s) | Free web service spins down after 15 min idle | Pre-warm with a ping request before demo |
| Gemini rate limits | Free tier daily request limits | Cache roadmap/analysis results; don't re-generate if unchanged |
| Judge0 on Oracle Cloud | Requires manual Docker setup | Document exact setup steps; keep instance running |
| Gmail SMTP limits | Free account email sending limits | Sufficient for academic scale |
| SSLCommerz sandbox | No real money movement | Clearly documented in README as sandbox-only |

---

## 14. Future Scope (Backend Impact)

These features are **explicitly deferred** from the current build. Backend groundwork notes:

### Multi-JD Comparison Mode
- Requires a new DB model: `JDComparisons` linking one CV to multiple JDs.
- Gemini prompt would need to accept an array of JD texts and return a comparison matrix.
- No schema changes needed to the current 19 models — additive only.

### Skill Graph Visualization
- The current `gap_skills` JSON field in `Analyses` already stores the raw data needed.
- Backend just needs a new endpoint: `GET /api/analysis/:id/skill-graph` returning nodes/edges format.

### Recruiter B2B Portal
- Requires a new `recruiters` user role and a separate `JobPostings` → `CandidateMatches` data flow.
- Major scope addition — separate planning document required.

### Peer Benchmarking
- Requires aggregate queries on `Analyses.ats_score` grouped by role category.
- Privacy-sensitive: all queries must use anonymous aggregates with minimum sample thresholds.

---

*This planning document was generated from CareerForge_BD_SRS.docx (Version 1.0, June 2026) and covers the backend implementation only. Frontend planning is handled separately.*

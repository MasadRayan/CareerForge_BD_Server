# CareerForge BD — API Documentation

> **Base URL:** `http://localhost:3000` (configurable via `PORT` in `.env`; default `5000`)  
> **Auth:** Most endpoints require `Authorization: Bearer <Firebase ID Token>`  
> **Content-Type:** `application/json` (except CV upload which is `multipart/form-data`)

---

## Standard Response Format

Every endpoint uses a uniform response envelope:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

**Error response (AppError):**

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication

### `POST /api/users/register`
Create a new user account (called after Firebase Auth sign-up).

**Auth:** None

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "experience_level": "mid",       // optional
  "target_role": "fullstack",      // optional
  "photoURL": "https://..."        // optional
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "free_user",
    "photoURL": "",
    "target_role": "fullstack",
    "experience_level": "mid",
    "created_at": "2026-07-29T10:00:00.000Z",
    "updated_at": "2026-07-29T10:00:00.000Z"
  }
}
```

**Note:** If the email already exists, the endpoint does **not** error — it returns `201` with the existing user record (idempotent sync).

---

### `GET /api/users/role`
Get the current authenticated user's role.

**Auth:** None in the route — ⚠️ **currently broken.** The controller reads `req.user.id` but no `verifyFBToken` middleware is mounted, so `req.user` is `undefined` and the endpoint throws a `500`. Fix pending; do not rely on it yet.

---

### `GET /api/users/me/:email`
Get a single user by email.

**Auth:** Firebase Token required

**Path Params:** `email` — user's email address

**Success Response (200):**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "free_user",
    "photoURL": "",
    "target_role": "fullstack",
    "experience_level": "mid",
    "created_at": "2026-07-29T10:00:00.000Z",
    "updated_at": "2026-07-29T10:00:00.000Z"
  }
}
```

**Error (404):** `{ "success": false, "message": "User not found" }`

---

### `PATCH /api/users/update/:email`
Update a user's profile.

**Auth:** Firebase Token required

**Path Params:** `email` — user's email address

**Request Body:**

```json
{
  "name": "John Updated",          // optional
  "experience_level": "senior",    // optional
  "photoURL": "https://new.url"    // optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

### `PATCH /api/users/role/:email`
Update a user's role (grant or revoke admin / premium access).

**Auth:** Firebase Token + Admin role required

**Path Params:** `email` — target user's email address

**Request Body:**

```json
{
  "role": "admin"
}
```

`role` must be one of: `"free_user"`, `"premium_user"`, `"admin"`

**Success Response (200):**

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "photoURL": "",
    "target_role": "fullstack",
    "experience_level": "mid",
    "created_at": "2026-07-29T10:00:00.000Z",
    "updated_at": "2026-07-29T10:00:00.000Z"
  }
}
```

**Errors:**
- `400` — `{ "success": false, "message": "Invalid role. Must be free_user, premium_user or admin" }`
- `400` — `{ "success": false, "message": "You cannot change your own role" }`
- `404` — `{ "success": false, "message": "User not found" }`

---

### `DELETE /api/users/delete/:email`
Delete a user account.

**Auth:** Firebase Token + Admin role required

**Path Params:** `email` — user's email address

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### `GET /api/users/all`
Get all users (paginated).

**Auth:** Firebase Token + Admin role required

**Query Params:** `page` (number, default: 1) — 10 users per page

**Success Response (200):**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "free_user",
        "photoURL": "",
        "target_role": "fullstack",
        "experience_level": "mid",
        "created_at": "2026-07-29T10:00:00.000Z",
        "updated_at": "2026-07-29T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 120,
      "totalPages": 12,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

## Job Descriptions (`/api/jd`)

**Auth:** All endpoints require Firebase Token

### `POST /api/jd`
Create a job description.

**Request Body:**

```json
{
  "title": "Senior Frontend Developer",
  "raw_text": "We are looking for a senior frontend developer... (full JD text)",
  "interview_date": "2026-08-15T00:00:00.000Z"    // optional, ISO 8601
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Job description created successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Senior Frontend Developer",
    "raw_text": "We are looking for...",
    "interview_date": "2026-08-15T00:00:00.000Z",
    "created_at": "2026-07-29T10:00:00.000Z"
  }
}
```

---

### `GET /api/jd`
Get all job descriptions for the authenticated user.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Job descriptions fetched successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Senior Frontend Developer",
      "raw_text": "We are looking for...",
      "interview_date": "2026-08-15T00:00:00.000Z",
      "created_at": "2026-07-29T10:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/jd/:id`
Get a single job description by ID.

**Path Params:** `id` — job description UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Job description fetched successfully",
  "data": { "id": "uuid", "title": "...", "raw_text": "...", "interview_date": "...", "created_at": "..." }
}
```

**Error (404):** `{ "success": false, "message": "Job description not found" }`

---

### `PATCH /api/jd/:id`
Update a job description.

**Path Params:** `id` — job description UUID

**Request Body:**

```json
{
  "title": "Updated Title",          // optional
  "raw_text": "Updated JD text...",  // optional
  "interview_date": "2026-09-01"     // optional
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Job description updated successfully",
  "data": { "id": "uuid", "title": "Updated Title", ... }
}
```

---

### `DELETE /api/jd/:id`
Delete a job description.

**Path Params:** `id` — job description UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Job description deleted successfully"
}
```

---

## CV (`/api/cv`)

**Auth:** All endpoints require Firebase Token

### `POST /api/cv`
Upload a CV file (PDF or DOCX).

**Content-Type:** `multipart/form-data`

**Form Field:** `file` — PDF or DOCX file (max 5MB)

**Success Response (201):**

```json
{
  "success": true,
  "message": "CV uploaded successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "version_number": 1,
    "file_url": "https://res.cloudinary.com/.../cvs/userId/cvId.pdf",
    "raw_text": "Full parsed text content of the CV...",
    "uploaded_at": "2026-07-29T10:00:00.000Z"
  }
}
```

**Limits:** Max 3 versions per user (oldest auto-deleted on new upload).

---

### `GET /api/cv`
Get all CVs for the authenticated user (list view, no `raw_text`).

**Success Response (200):**

```json
{
  "success": true,
  "message": "CVs fetched successfully",
  "data": [
    {
      "id": "uuid",
      "version_number": 1,
      "file_url": "https://res.cloudinary.com/...",
      "uploaded_at": "2026-07-29T10:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/cv/all`
Get all CVs across all users (paginated, searchable). Admin-only.

**Auth:** Firebase Token + Admin role required

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Filter by user name or user email (case-insensitive partial match) |
| `page` | number | 1 | |
| `limit` | number | 10 | Max 50 |

**Success Response (200):**

```json
{
  "success": true,
  "message": "CVs fetched successfully",
  "data": {
    "cvs": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "version_number": 1,
        "file_url": "https://res.cloudinary.com/...",
        "uploaded_at": "2026-07-29T10:00:00.000Z",
        "user": {
          "name": "John Doe",
          "email": "john@example.com",
          "photoURL": "https://..."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 120,
      "totalPages": 12,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

> **Note:** `raw_text` is omitted from the list view. Order is by `uploaded_at` descending.

---

### `GET /api/cv/:id`
Get a single CV by ID (includes `raw_text`).

**Path Params:** `id` — CV UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "CV fetched successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "version_number": 1,
    "file_url": "https://res.cloudinary.com/...",
    "raw_text": "Full parsed text...",
    "uploaded_at": "2026-07-29T10:00:00.000Z"
  }
}
```

---

### `DELETE /api/cv/:id`
Delete a CV.

**Path Params:** `id` — CV UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "CV deleted successfully"
}
```

---

### `POST /api/cv/:id/skills`
Extract skills from a CV using AI (Groq). The result is not auto-saved — the frontend is expected to persist it onto the user's profile.

**Path Params:** `id` — CV UUID

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "Skills extracted successfully",
  "data": {
    "skills": ["React", "TypeScript", "Node.js", "Docker", "AWS"]
  }
}
```

**Errors:**
- `404` — `CV not found`
- `502` — `AI service is unavailable. Please try again in a moment.`

---

## Analysis (`/api/analysis`)

**Auth:** All endpoints require Firebase Token

### `POST /api/analysis`
Run an ATS analysis comparing a CV against a job description.

**Request Body:**

```json
{
  "cv_id": "uuid-of-cv",
  "jd_id": "uuid-of-job-description"
}
```

**Free-tier users** are limited to N analyses/month (default: 5). Premium users have unlimited.

**Success Response (201):**

```json
{
  "success": true,
  "message": "Analysis created successfully",
  "data": {
    "id": "uuid",
    "cv_id": "uuid",
    "jd_id": "uuid",
    "ats_score": 78,
    "keyword_match_breakdown": {
      "matched_keywords": ["react", "typescript", "node", "aws"],
      "missing_keywords": ["docker", "kubernetes", "graphql"],
      "formatting_issues": ["Missing section headers"],
      "missing_sections": ["Projects", "Certifications"]
    },
    "gap_skills": ["Docker", "Kubernetes", "GraphQL"],
    "rewrite_suggestions": [
      {
        "original": "Worked on frontend features",
        "suggested": "Developed responsive React components with TypeScript, improving page load by 40%",
        "explanation": "Adds measurable impact and specific technologies"
      }
    ],
    "created_at": "2026-07-29T10:00:00.000Z"
  }
}
```

**Error (429):** `{ "success": false, "message": "Free tier limit reached (5 analyses/month). Upgrade to premium for unlimited analyses." }`

---

### `GET /api/analysis`
Get all analyses for the authenticated user (summary list).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Analyses fetched successfully",
  "data": [
    {
      "id": "uuid",
      "cv_id": "uuid",
      "jd_id": "uuid",
      "ats_score": 78,
      "created_at": "2026-07-29T10:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/analysis/:id`
Get a single analysis with full details.

**Path Params:** `id` — analysis UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Analysis fetched successfully",
  "data": {
    "id": "uuid",
    "cv_id": "uuid",
    "jd_id": "uuid",
    "ats_score": 78,
    "keyword_match_breakdown": { ... },
    "gap_skills": ["Docker", "Kubernetes"],
    "rewrite_suggestions": [ ... ],
    "created_at": "2026-07-29T10:00:00.000Z"
  }
}
```

---

### `DELETE /api/analysis/:id`
Delete an analysis.

**Path Params:** `id` — analysis UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Analysis deleted successfully"
}
```

---

## Roadmap (`/api/roadmap`)

**Auth:** All endpoints require Firebase Token

### `POST /api/roadmap`
Generate an AI-powered learning roadmap based on an analysis.

**Request Body:**

```json
{
  "analysis_id": "uuid-of-analysis",
  "duration_weeks": 8
}
```

`duration_weeks` is optional. If omitted, computed from the job's `interview_date` (capped at 12 weeks, min 1).

**Success Response (201):**

```json
{
  "success": true,
  "message": "Roadmap generated successfully",
  "data": {
    "id": "uuid",
    "analysis_id": "uuid",
    "user_id": "uuid",
    "duration_weeks": 8,
    "status": "active",
    "created_at": "2026-07-29T10:00:00.000Z",
    "weeks": [
      {
        "id": "uuid",
        "roadmap_id": "uuid",
        "week_number": 1,
        "topic_summary": "React Fundamentals & TypeScript",
        "start_date": "2026-07-29T00:00:00.000Z",
        "end_date": "2026-08-04T23:59:59.999Z",
        "is_unlocked": true,
        "unlocked_at": "2026-07-29T10:00:00.000Z",
        "resources": [
          {
            "id": "uuid",
            "roadmap_week_id": "uuid",
            "title": "React Official Tutorial",
            "url": "https://react.dev/learn",
            "type": "docs"
          },
          {
            "id": "uuid",
            "roadmap_week_id": "uuid",
            "title": "TypeScript Handbook",
            "url": "https://typescriptlang.org/docs/",
            "type": "docs"
          }
        ],
        "dailyTasks": [
          {
            "id": "uuid",
            "roadmap_week_id": "uuid",
            "description": "Complete React tutorial chapter 1-3",
            "is_completed": false,
            "completed_at": null
          }
        ]
      }
    ]
  }
}
```

---

### `GET /api/roadmap`
Get all roadmaps for the authenticated user (summary list).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Roadmaps fetched successfully",
  "data": [
    {
      "id": "uuid",
      "analysis_id": "uuid",
      "duration_weeks": 8,
      "status": "active",
      "created_at": "2026-07-29T10:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/roadmap/:id`
Get a single roadmap with all weeks, resources, and tasks.

**Path Params:** `id` — roadmap UUID

**Success Response (200):** Same structure as POST response's `data`

---

### `PATCH /api/roadmap/:id`
Update roadmap status.

**Path Params:** `id` — roadmap UUID

**Request Body:**

```json
{
  "status": "completed"
}
```

Valid statuses: `"active"`, `"completed"`, `"abandoned"`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Roadmap status updated",
  "data": {
    "id": "uuid",
    "analysis_id": "uuid",
    "user_id": "uuid",
    "duration_weeks": 8,
    "status": "completed",
    "created_at": "2026-07-29T10:00:00.000Z"
  }
}
```

---

### `PATCH /api/roadmap/:id/tasks/:taskId`
Mark a daily task as completed.

**Path Params:**
- `id` — roadmap UUID
- `taskId` — daily task UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Task marked complete",
  "data": {
    "id": "uuid",
    "roadmap_week_id": "uuid",
    "description": "Complete React tutorial chapter 1-3",
    "is_completed": true,
    "completed_at": "2026-07-29T12:00:00.000Z"
  }
}
```

**Error (409):** `{ "success": false, "message": "Task is already completed" }`

---

### `DELETE /api/roadmap/:id`
Delete a roadmap.

**Path Params:** `id` — roadmap UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Roadmap deleted successfully"
}
```

---

## Roadmap Test System (`/api/roadmap`)

**Auth:** All endpoints require Firebase Token

The roadmap is gated by a two-step test system:

1. **Weekly tests** — each week has a 5-question MCQ test. Week 1 is unlocked by default. To unlock week *N+1* you must complete **all daily tasks** of week *N* **and pass** week *N*'s test with **≥ 60%**. Retakes are unlimited until you pass (re-submitting after passing returns a `409`).
2. **Final exam** — once every weekly test has been passed, a 30-question cumulative exam becomes available. Passing it (≥ 60%) sets the roadmap `status` to `completed` (certificate generation comes later).

Questions are AI-generated per week from the week's topic and are returned **without** the correct answers. The correct answer is only revealed in the submit response.

---

### `GET /api/roadmap/:roadmapId/weeks/:weekId/test`
Fetch the weekly test questions for a specific week.

**Path Params:**
- `roadmapId` — roadmap UUID
- `weekId` — roadmap week UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Week 1 test fetched successfully",
  "data": {
    "test_id": "uuid",
    "week_number": 1,
    "pass_score": 60,
    "already_passed": false,
    "questions": [
      {
        "id": "uuid",
        "question_text": "What does REST stand for in web development?",
        "options": {
          "a": "Remote Execution of Shared Tasks",
          "b": "Representational State Transfer",
          "c": "Reliable Endpoint Service Technology",
          "d": "Resource Encoding and Serialisation Technology"
        },
        "difficulty": "easy"
      }
    ]
  }
}
```

**Errors:**
- `403` — `Week N is locked. Pass the previous week's test to unlock it.`
- `409` — `Complete all daily tasks for this week before taking its test`

---

### `POST /api/roadmap/:roadmapId/weeks/:weekId/test/submit`
Submit answers for a weekly test and get the graded result.

**Path Params:**
- `roadmapId` — roadmap UUID
- `weekId` — roadmap week UUID

**Request Body:**

```json
{
  "answers": [
    { "question_id": "uuid-of-q1", "selected_answer": "b" },
    { "question_id": "uuid-of-q2", "selected_answer": "c" }
  ]
}
```

`answers` must contain exactly as many entries as the test's question count (5). `selected_answer` is one of `a | b | c | d`.

**Success Response (200) — passed (next week unlocked):**

```json
{
  "success": true,
  "message": "Test passed with 80%. Week 2 unlocked.",
  "data": {
    "attempt_id": "uuid",
    "score": 80,
    "passed": true,
    "correct_count": 4,
    "total_questions": 5,
    "answers": [
      { "question_id": "uuid-of-q1", "selected_answer": "b", "is_correct": true },
      { "question_id": "uuid-of-q2", "selected_answer": "c", "is_correct": false }
    ],
    "next_unlocked_week": 2
  }
}
```

**Success Response (200) — passed (last week, final exam now available):**

```json
{
  "success": true,
  "message": "Test passed with 80%. Final exam now available.",
  "data": {
    "attempt_id": "uuid",
    "score": 80,
    "passed": true,
    "correct_count": 4,
    "total_questions": 5,
    "answers": [
      { "question_id": "uuid-of-q1", "selected_answer": "a", "is_correct": true },
      { "question_id": "uuid-of-q2", "selected_answer": "c", "is_correct": false }
    ]
  }
}
```

**Success Response (200) — failed (no unlock, retry allowed):**

```json
{
  "success": true,
  "message": "Test failed with 40%. Passing score is 60%.",
  "data": {
    "attempt_id": "uuid",
    "score": 40,
    "passed": false,
    "correct_count": 2,
    "total_questions": 5,
    "answers": [
      { "question_id": "uuid-of-q1", "selected_answer": "b", "is_correct": true },
      { "question_id": "uuid-of-q2", "selected_answer": "d", "is_correct": false }
    ]
  }
}
```

**Errors:**
- `409` — `Test already passed`
- `400` — `Answer count must match the test size (5)`

---

### `GET /api/roadmap/:roadmapId/final-exam`
Fetch the final exam questions (30 questions across the whole roadmap).

**Path Params:**
- `roadmapId` — roadmap UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Final exam fetched successfully",
  "data": {
    "exam_id": "uuid",
    "roadmap_id": "uuid",
    "pass_score": 60,
    "already_passed": false,
    "questions": [
      {
        "id": "uuid",
        "question_text": "Question text here",
        "options": { "a": "...", "b": "...", "c": "...", "d": "..." },
        "difficulty": "medium"
      }
    ]
  }
}
```

**Error:** `403` — `Complete and pass every weekly test before attempting the final exam`

---

### `POST /api/roadmap/:roadmapId/final-exam/submit`
Submit answers for the final exam.

**Path Params:**
- `roadmapId` — roadmap UUID

**Request Body:**

```json
{
  "answers": [
    { "question_id": "uuid-of-q1", "selected_answer": "b" },
    { "question_id": "uuid-of-q2", "selected_answer": "a" }
  ]
}
```

`answers` must contain exactly 30 entries. `selected_answer` is one of `a | b | c | d`.

**Success Response (200) — passed (roadmap completed):**

```json
{
  "success": true,
  "message": "Congratulations! You passed the final exam. Roadmap completed.",
  "data": {
    "attempt_id": "uuid",
    "score": 90,
    "passed": true,
    "correct_count": 27,
    "total_questions": 30,
    "answers": [
      { "question_id": "uuid-of-q1", "selected_answer": "b", "is_correct": true },
      { "question_id": "uuid-of-q2", "selected_answer": "a", "is_correct": true }
    ],
    "roadmap_completed": true
  }
}
```

**Success Response (200) — failed:**

```json
{
  "success": true,
  "message": "Final exam failed with 50%. Passing score is 60%.",
  "data": {
    "attempt_id": "uuid",
    "score": 50,
    "passed": false,
    "correct_count": 15,
    "total_questions": 30,
    "answers": [
      { "question_id": "uuid-of-q1", "selected_answer": "b", "is_correct": true },
      { "question_id": "uuid-of-q2", "selected_answer": "a", "is_correct": false }
    ]
  }
}
```

**Errors:**
- `409` — `Final exam already passed`
- `400` — `Answer count must match the exam size (30)`

---

## Quiz (`/api/quiz`)

**Auth:** All endpoints require Firebase Token

### `GET /api/quiz`
Get quiz questions (filtered, paginated, shuffled).

**Query Params:**
| Param | Type | Default | Values |
|-------|------|---------|--------|
| `role_category` | string | — | `backend`, `frontend`, `fullstack`, `devops`, `data-science` |
| `difficulty` | string | — | `easy`, `medium`, `hard` |
| `page` | number | 1 | |
| `limit` | number | 10 | max 50 |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Fetched 10 question(s) successfully",
  "data": {
    "questions": [
      {
        "id": "uuid",
        "role_category": "frontend",
        "question_text": "What is the virtual DOM in React?",
        "options": {
          "a": "A direct copy of the real DOM",
          "b": "A lightweight JavaScript representation of the DOM",
          "c": "A browser API for DOM manipulation",
          "d": "A CSS framework"
        },
        "difficulty": "medium"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 220,
      "totalPages": 22,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

> **Note:** The `correct_answer` is intentionally omitted from GET responses. It is only revealed after submitting an attempt.

---

### `POST /api/quiz/attempt`
Submit a quiz attempt (answer a question).

**Request Body:**

```json
{
  "question_id": "uuid-of-question",
  "selected_answer": "b"
}
```

`selected_answer` must be one of: `"a"`, `"b"`, `"c"`, `"d"`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Correct! Well done.",
  "data": {
    "attempt_id": "uuid",
    "question_id": "uuid",
    "selected_answer": "b",
    "correct_answer": "b",
    "is_correct": true,
    "attempted_at": "2026-07-29T10:00:00.000Z"
  }
}
```

**Incorrect response:**

```json
{
  "success": true,
  "message": "Incorrect. The correct answer was \"b\".",
  "data": {
    "attempt_id": "uuid",
    "question_id": "uuid",
    "selected_answer": "a",
    "correct_answer": "b",
    "is_correct": false,
    "attempted_at": "2026-07-29T10:00:00.000Z"
  }
}
```

---

### `GET /api/quiz/stats`
Get quiz performance statistics.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Quiz stats fetched successfully",
  "data": {
    "total_attempted": 25,
    "correct": 18,
    "incorrect": 7,
    "accuracy_percent": 72,
    "by_difficulty": {
      "easy": { "attempted": 10, "correct": 9 },
      "medium": { "attempted": 10, "correct": 7 },
      "hard": { "attempted": 5, "correct": 2 }
    }
  }
}
```

---

### `GET /api/quiz/history`
Get quiz attempt history (ordered by most recent).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Attempt history fetched successfully",
  "data": [
    {
      "id": "uuid",
      "selected_answer": "b",
      "is_correct": true,
      "attempted_at": "2026-07-29T10:00:00.000Z",
      "question": {
        "id": "uuid",
        "question_text": "What is the virtual DOM in React?",
        "correct_answer": "b",
        "difficulty": "medium",
        "role_category": "frontend"
      }
    }
  ]
}
```

---

## Behavioral Questions (`/api/behavioral-questions`)

**Auth:** All endpoints require Firebase Token

### `GET /api/behavioral-questions`
Get behavioral questions (paginated).

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `category` | string | — | `teamwork`, `leadership`, `conflict-resolution`, `communication`, `problem-solving` |
| `page` | number | 1 | |
| `limit` | number | 10 | max 50 |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Fetched 10 question(s) successfully",
  "data": {
    "questions": [
      {
        "id": "uuid",
        "question_text": "Tell me about a time you resolved a conflict within your team.",
        "category": "conflict-resolution"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 30,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

### `GET /api/behavioral-questions/:id`
Get a single behavioral question.

**Path Params:** `id` — question UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Question fetched successfully",
  "data": {
    "id": "uuid",
    "question_text": "Tell me about a time you resolved a conflict within your team.",
    "category": "conflict-resolution"
  }
}
```

---

### `POST /api/behavioral-questions/:id/answer`
Submit an answer to a behavioral question. AI feedback is generated automatically.

**Path Params:** `id` — question UUID

**Request Body:**

```json
{
  "answer_text": "In my previous role as a frontend developer, two team members disagreed on the component architecture approach. I scheduled a meeting where each person could present their case with pros and cons. We agreed to do a small proof-of-concept for both approaches over two days. The team ultimately chose the more scalable solution, and both members felt heard throughout the process."
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Answer submitted successfully",
  "data": {
    "id": "uuid",
    "question_id": "uuid",
    "answer_text": "In my previous role...",
    "ai_feedback": {
      "structure_score": 8,
      "star_adherence": "good",
      "strengths": [
        "Clear situation description",
        "Action steps are well-defined"
      ],
      "suggestions": [
        "Add a specific measurable result",
        "Quantify the impact of your solution"
      ],
      "improved_example": "After the proof-of-concept, we chose the scalable solution which reduced our component development time by 30%..."
    },
    "answered_at": "2026-07-29T10:00:00.000Z"
  }
}
```

---

### `GET /api/behavioral-questions/answers`
Get all your submitted answers with AI feedback.

**Success Response (200):**

```json
{
  "success": true,
  "message": "Fetched 5 answer(s) successfully",
  "data": [
    {
      "id": "uuid",
      "question_id": "uuid",
      "question_text": "Tell me about a time you resolved a conflict within your team.",
      "category": "conflict-resolution",
      "answer_text": "In my previous role...",
      "ai_feedback": {
        "structure_score": 8,
        "star_adherence": "good",
        "strengths": [...],
        "suggestions": [...],
        "improved_example": "..."
      },
      "answered_at": "2026-07-29T10:00:00.000Z"
    }
  ]
}
```

---

## Readiness Score (`/api/readiness-score`)

**Auth:** All endpoints require Firebase Token

### `GET /api/readiness-score`
Calculate and get the current readiness score.

**Formula:** `composite = (ATS × 0.35) + (Roadmap Progress × 0.35) + (Interview Readiness × 0.30)`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Readiness score calculated successfully",
  "data": {
    "id": "uuid",
    "ats_component": 78,
    "roadmap_component": 45,
    "interview_component": 62,
    "sub_scores": {
      "quiz_accuracy": 72,
      "behavioral_score": 80
    },
    "composite_score": 61,
    "calculated_at": "2026-07-29T10:00:00.000Z"
  }
}
```

---

### `GET /api/readiness-score/history`
Get readiness score history (last 20 records).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Fetched 5 record(s) successfully",
  "data": [
    {
      "id": "uuid",
      "composite_score": 61,
      "ats_component": 78,
      "roadmap_component": 45,
      "interview_component": 62,
      "calculated_at": "2026-07-29T10:00:00.000Z"
    }
  ]
}
```

---

## Notifications (`/api/notifications`)

**Auth:** Firebase Token + Admin role required

### `POST /api/notifications/reminder`
Send a study reminder email to a user.

**Request Body:**

```json
{
  "user_id": "uuid"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Study reminder sent successfully"
}
```

---

### `POST /api/notifications/expiry`
Send a subscription expiry notification email to a user.

**Request Body:**

```json
{
  "user_id": "uuid",
  "days_left": 7
}
```

`days_left` is optional (default: 7).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Subscription expiry email sent successfully"
}
```

---

## Subscription / Payment (`/api/subscription`)

### `POST /api/subscription/checkout`
Create a Stripe Checkout session for premium subscription.

**Auth:** None

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "Checkout session created successfully",
  "data": {
    "paymentURL": "https://checkout.stripe.com/c/pay/cs_test_..."
  }
}
```

Redirect user to `paymentURL` to complete payment.

---

### `POST /api/subscription/webhook`
Stripe webhook endpoint (called by Stripe server-side).

**Auth:** None (uses raw body + Stripe signature verification)

**Headers:** `stripe-signature: <webhook signature>`

**Body:** Raw Stripe event (Buffer)

**Events handled:**
- `checkout.session.completed` — activates premium subscription **and upgrades the user's role to `premium_user`** (admin users are never downgraded)
- `customer.subscription.created` — syncs subscription status; ensures role is `premium_user` while active
- `customer.subscription.deleted` — marks subscription as cancelled/expired **and downgrades the user's role back to `free_user`** (only when no active subscription remains)

> **Note:** The user's `role` is only ever changed server-side by this webhook. There is no client-facing endpoint that can set a role.

---

### `GET /api/subscription/status`
Get the current user's subscription status.

**Auth:** Firebase Token required

**Success Response (200):**

```json
{
  "success": true,
  "message": "Subscription status retrieved successfully",
  "data": {
    "status": "active",
    "isSubscribed": true,
    "currentPeriodEnd": "2026-08-28T10:00:00.000Z"
  }
}
```

**No subscription:**

```json
{
  "success": true,
  "message": "Subscription status retrieved successfully",
  "data": {
    "status": null,
    "isSubscribed": false,
    "currentPeriodEnd": null
  }
}
```

---

### `GET /api/subscription/history`
Get payment/subscription history for the current user.

**Auth:** Firebase Token required

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "plan": "premium",
      "status": "active",
      "startedAt": "2026-07-29T10:00:00.000Z",
      "currentPeriodEnd": "2026-08-28T10:00:00.000Z",
      "stripeSubscriptionId": "sub_...",
      "createdAt": "2026-07-29T10:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/subscription/all-payments`
Get all subscription/payment records across all users (paginated, searchable).

**Auth:** Firebase Token + Admin role required

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Filter by user name, user email, Stripe customer ID, or Stripe subscription ID (case-insensitive partial match) |
| `page` | number | 1 | |
| `limit` | number | 10 | Max 50 |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payments fetched successfully",
  "data": {
    "payments": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "plan": "premium",
        "status": "active",
        "started_at": "2026-07-29T10:00:00.000Z",
        "currentPeriodEnd": "2026-08-28T10:00:00.000Z",
        "created_at": "2026-07-29T10:00:00.000Z",
        "user": {
          "name": "John Doe",
          "email": "john@example.com",
          "photoURL": "https://..."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 120,
      "totalPages": 12,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

> **Note:** The subscription rate is a fixed **5000 BDT**. Revenue metrics in
> `/api/analytics/admin` are derived from this rate.

---

## Analytics (`/api/analytics`)

**Auth:** `/public` requires no auth; `/status` requires Firebase Token; `/admin` requires Firebase Token + Admin role

### `GET /api/analytics/public`
Get aggregate platform statistics for the public landing page (logged-out visitors).

**Auth:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "Public analytics retrieved successfully",
  "data": {
    "cvsAnalyzed": 2500,
    "starRewrites": 12000,
    "careerRoadmaps": 850,
    "mockInterviews": 700,
    "totalUsers": 2000
  }
}
```

---

### `GET /api/analytics/status`
Get the current user's analytics dashboard data.

**Success Response (200):**

```json
{
  "success": true,
  "message": "User status retrieved successfully",
  "data": {
    "subscription": {
      "plan": "premium",
      "status": "active",
      "currentPeriodEnd": "2026-08-28T10:00:00.000Z",
      "startedAt": "2026-07-29T10:00:00.000Z"
    },
    "usage": {
      "analysesUsedThisMonth": 3,
      "analysesLimit": 100,
      "resetDate": "2026-08-28T10:00:00.000Z"
    },
    "streak": {
      "current": 5,
      "longest": 12,
      "lastActive": "2026-07-29T00:00:00.000Z"
    },
    "content": {
      "totalCvs": 2,
      "totalAnalyses": 5,
      "totalRoadmaps": 2,
      "totalQuizAttempts": 25,
      "quizAccuracy": 72,
      "totalBehavioralAnswers": 8
    },
    "readinessScore": 61
  }
}
```

---

### `GET /api/analytics/admin`
Get admin-level analytics (requires admin role).

**Auth:** Firebase Token + Admin role required

> **Note:** Revenue is derived from the subscriptions model at a fixed rate of **5000 BDT / subscription** (`mrr` = active subscriptions created this month × 5000; `totalRevenue` = active subscriptions × 5000; `revenueByMonth` = all subscription records grouped by month × 5000).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Admin analytics retrieved successfully",
  "data": {
    "mrr": 60000,
    "activeSubscribers": 120,
    "totalRevenue": 600000,
    "churnRate": 0.05,
    "totalUsers": 850,
    "userSplit": {
      "free_user": 700,
      "premium_user": 120,
      "admin": 3
    },
    "revenueByMonth": [
      { "month": "2026-01", "revenue": 20000 },
      { "month": "2026-02", "revenue": 21000 }
    ],
    "newSignupsThisMonth": 45,
    "newSubscriptionsThisMonth": 12,
    "totalAnalyses": 2500,
    "totalCvs": 1800,
    "totalRoadmaps": 600
  }
}
```

---

## Skill Certificates (`/api/certificate`)

**Auth:** All endpoints require Firebase Token, except `GET /verify/:certNumber` which is public.

Users can earn a certificate for any skill in their profile (`Users.skills`). The flow:

1. **Start a test** — `POST /api/certificate/test` with a profile skill. The server AI-generates **10 multiple-choice questions** specific to that skill (returned **without** answers).
2. **Submit** — `POST /api/certificate/test/:attemptId/submit` with the user's answers. The server grades them and, if the score is **≥ 60%**, generates a PDF certificate (branded A4 landscape), uploads it to Cloudinary, and returns its URL + a unique verification code.
3. **Share / verify** — anyone can verify a certificate via its code without auth.

Rules:
- Only skills present in the user's profile can be certified (`403` otherwise).
- A failed attempt is saved (no certificate) and can be retried with a fresh attempt.
- An already-submitted attempt cannot be re-submitted (`409`).

---

### `POST /api/certificate/test`
Start a skill test. Generates 10 AI questions for the given skill.

**Request Body:**

```json
{
  "skill": "React"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Skill test generated successfully",
  "data": {
    "attempt_id": "uuid",
    "skill": "React",
    "pass_score": 60,
    "questions": [
      {
        "id": "uuid",
        "question_text": "What is the virtual DOM in React?",
        "options": {
          "a": "A direct copy of the real DOM",
          "b": "A lightweight JavaScript representation of the DOM",
          "c": "A browser API for DOM manipulation",
          "d": "A CSS framework"
        },
        "difficulty": "medium"
      }
    ]
  }
}
```

> **Note:** `correct_answer` is intentionally omitted. It is only revealed in the submit response.

**Errors:**
- `403` — `This skill is not in your profile. Only profile skills can be certified.`
- `502` — `AI service was unable to prepare this test. Please try again in a moment.`

---

### `POST /api/certificate/test/:attemptId/submit`
Submit answers for a skill test and get the graded result. Issues a certificate on pass.

**Path Params:** `attemptId` — skill test attempt UUID (from the start response)

**Request Body:**

```json
{
  "answers": [
    { "question_id": "uuid-of-q1", "selected_answer": "b" },
    { "question_id": "uuid-of-q2", "selected_answer": "c" }
  ]
}
```

`answers` must contain exactly as many entries as the test's question count (10). `selected_answer` is one of `a | b | c | d`.

**Success Response (200) — passed (certificate issued):**

```json
{
  "success": true,
  "message": "Test passed. Certificate issued.",
  "data": {
    "attempt_id": "uuid",
    "score": 80,
    "passed": true,
    "correct_count": 8,
    "total_questions": 10,
    "answers": [
      { "question_id": "uuid-of-q1", "selected_answer": "b", "is_correct": true },
      { "question_id": "uuid-of-q2", "selected_answer": "c", "is_correct": false }
    ],
    "certificate": {
      "id": "uuid",
      "skill": "React",
      "score": 80,
      "cert_number": "CFC-8F3A92B4",
      "pdf_url": "https://res.cloudinary.com/.../certificates/cert-<attemptId>.pdf",
      "issued_at": "2026-08-07T14:00:00.000Z"
    }
  }
}
```

**Success Response (200) — failed (no certificate, retry allowed):**

```json
{
  "success": true,
  "message": "Test failed with 40%. Passing score is 60%.",
  "data": {
    "attempt_id": "uuid",
    "score": 40,
    "passed": false,
    "correct_count": 4,
    "total_questions": 10,
    "answers": [
      { "question_id": "uuid-of-q1", "selected_answer": "b", "is_correct": true },
      { "question_id": "uuid-of-q2", "selected_answer": "c", "is_correct": false }
    ]
  }
}
```

**Errors:**
- `404` — `Attempt not found or not owned by you`
- `409` — `This test has already been submitted`
- `400` — `Answer count must match the test size (10)`
- `400` — `Question <id> does not belong to this test`

---

### `GET /api/certificate`
List all certificates issued to the authenticated user (newest first).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Certificates fetched successfully",
  "data": [
    {
      "id": "uuid",
      "skill": "React",
      "score": 80,
      "cert_number": "CFC-8F3A92B4",
      "pdf_url": "https://res.cloudinary.com/...",
      "issued_at": "2026-08-07T14:00:00.000Z"
    }
  ]
}
```

---

### `GET /api/certificate/:id`
Get a single certificate owned by the authenticated user.

**Path Params:** `id` — certificate UUID

**Success Response (200):**

```json
{
  "success": true,
  "message": "Certificate fetched successfully",
  "data": {
    "id": "uuid",
    "skill": "React",
    "score": 80,
    "cert_number": "CFC-8F3A92B4",
    "pdf_url": "https://res.cloudinary.com/...",
    "issued_at": "2026-08-07T14:00:00.000Z"
  }
}
```

**Error (404):** `{ "success": false, "message": "Certificate not found or not owned by you" }`

---

### `GET /api/certificate/verify/:certNumber`
Publicly verify a certificate by its verification code (no auth required).

**Path Params:** `certNumber` — certificate verification code (e.g. `CFC-8F3A92B4`)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Certificate verified successfully",
  "data": {
    "valid": true,
    "holder_name": "John Doe",
    "skill": "React",
    "score": 80,
    "issued_at": "2026-08-07T14:00:00.000Z"
  }
}
```

**Error (404):** `{ "success": false, "message": "Certificate not found" }`

---

## Jobs (`/api/jobs`)

**Auth:** `GET /search` requires Firebase Token. `POST /refresh-w3schools` and `POST /crawl` are **cron/admin-only** and are authenticated with the `CRON_SECRET` (sent as `Authorization: Bearer <CRON_SECRET>`), not a Firebase token.

### `GET /api/jobs/search`
Search jobs scraped into the local database (from BDJobs and W3Schools catalog). Hits the DB only — no browser/scraping at request time.

**Query Params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | — | Search text (tokenized full-text match on title/company/location/category) |
| `page` | number | 1 | |
| `limit` | number | 10 | Max 50 |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "data": {
    "jobs": [
      {
        "id": "uuid",
        "title": "Senior React Developer (Dhaka)",
        "company": "Example Ltd",
        "location": "Dhaka, Bangladesh",
        "salary": "Negotiable",
        "job_type": "Full-time",
        "publication_date": "2026-07-28T00:00:00.000Z",
        "tags": ["software"],
        "snippet": "We are looking for a senior React developer ...",
        "url": "https://www.bdjobs.com/jobdetails/xyz"
      }
    ],
    "page": 1,
    "limit": 10,
    "page_count": 12,
    "total_jobs": 118
  }
}
```

**Error (502):** `Job search is unavailable. Please try again in a moment.`

---

### `POST /api/jobs/refresh-w3schools`
Refresh the W3Schools skill/reference catalog.

**Auth:** `Authorization: Bearer <CRON_SECRET>`

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "W3Schools catalog refreshed (250 links)",
  "data": { "count": 250 }
}
```

**Error (401):** `{ "success": false, "message": "Unauthorized" }`

---

### `POST /api/jobs/crawl`
Trigger a BDJobs crawl for a search term.

**Auth:** `Authorization: Bearer <CRON_SECRET>`

**Request Body:**

```json
{
  "searchTerm": "react developer",
  "maxPages": 3
}
```

`searchTerm` is required; `maxPages` is optional (default 3).

**Success Response (200):**

```json
{
  "success": true,
  "message": "Crawl complete: 45 jobs saved",
  "data": { "saved": 45 }
}
```

**Errors:**
- `401` — `{ "success": false, "message": "Unauthorized" }`
- `400` — `{ "success": false, "message": "searchTerm is required" }`

---

## Health Check

### `GET /`
Root endpoint — returns service metadata.

**Auth:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "CareerForge BD API is running",
  "author": "masad Rayan",
  "timestamp": "2026-07-29T10:00:00.000Z"
}
```

---

### `GET /health`
Check API health status.

**Auth:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "CareerForge BD API is running",
  "environment": "development",
  "timestamp": "2026-07-29T10:00:00.000Z"
}
```

---

## Error Reference

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing fields, validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Resource not found |
| 409 | Conflict (e.g., task already completed) |
| 422 | Validation error (invalid payload) |
| 429 | Rate limit / quota exceeded |
| 500 | Internal server error |
| 502 | Upstream service error (AI/Cloudinary) |

---

## Auth Headers

Add this header to all protected routes:

```
Authorization: Bearer <firebase-id-token>
```

The token is verified via Firebase Admin SDK. The user is then looked up by email in the database.

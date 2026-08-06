# CareerForge BD — API Documentation

> **Base URL:** `http://localhost:8000`  
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

**Error (400):** `{ "success": false, "message": "User already exists" }`

---

### `GET /api/users/role`
Get the current authenticated user's role.

**Auth:** None (uses query param? no, actually no auth. Let me check — controller uses `req.user!.id` but there's no middleware. **Note:** This may be broken — it tries to access `req.user.id` but no `verifyFBToken` middleware. Currently returns error.)

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
  "data": [
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
  ]
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

## Health Check

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

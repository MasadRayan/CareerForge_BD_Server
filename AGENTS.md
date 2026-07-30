# CareerForge BD — AGENTS.md

## Commands

| Action | Command | Notes |
|--------|---------|-------|
| Dev server | `npm run dev` | `tsx watch src/server.ts` |
| Build | `npm run build` | `tsc` → `dist/` |
| Tests | `npm test` | No jest config — will fail |
| Prisma generate | `npm run prisma:generate` | Outputs to `generated/prisma/` |
| Prisma migrate | `npm run prisma:migrate` | Multi-file schema in `prisma/schema/` (23 files) |
| Prisma studio | `npm run prisma:studio` | |
| Prisma seed | `npm run prisma:seed` | 220 quiz questions, all `correct_answer: "a"` (dev) |
| Stripe webhook | `npm run stripe:webhook` | `stripe listen --forward-to localhost:8000/api/subscription/webhook` |

## Architecture

- **ESM** (`"type": "module"`). Relative imports **must use `.js`** for `.ts` files. `tsx` tolerates omission; Node.js ESM at runtime does not.
- **Module-per-feature** at `src/module/<name>/` (singular). Mounted in `src/app.ts` at `/api/<name>`.
- **Express 5**. Standard middleware signatures.
- **Prisma**: multi-file schema (23 `.prisma` under `prisma/schema/`), generated client to `generated/prisma`, `@prisma/adapter-pg`. All models use `uuid()` PK + `@@map` snake_case. Users PK is `@default(uuid())` (not Firebase UID — lookup by email).
- **AI**: Both Groq (`llama-3.1-8b-instant`) and Gemini (`gemini-1.5-flash`) initialized. The analysis, roadmap, and behavioral services use **Groq**. Gemini SDK available but unused in services.
- **Firebase Admin** initialized from `careerforge_admin.json` (JSON file on disk, not env vars).
- **Auth**: `verifyFBToken` validates `Authorization: Bearer <token>`, looks up user by `email`, sets `req.user` (`{ id, name, email, role }`).
- **Payments**: planning.md says SSLCommerz, but actual config (`src/lib/stripe.ts`) uses **Stripe**. Payment module files exist at `src/module/payment/` but controllers/services are empty stubs — not functional.
- **CV parsing**: `src/lib/cv.parser.ts` (pdf-parse + mammoth), `src/lib/cv.upload.ts` (Cloudinary stream upload).
- **Companion doc**: `CONVENTIONS.md` has the definitive module template and coding conventions. Check it when building new modules.

## Known Bugs

| Severity | Bug | File |
|----------|-----|------|
| CRITICAL | `verifyAdmin` always calls `return next()` after unauthorized `sendResponse` — bypasses admin check | `src/middleware/verifyAdmin.ts:24-26` |
| HIGH | IDOR — user routes use `:email` path params instead of `req.user` identity | `src/module/user/user.route.ts` |
| HIGH | Quota double-counted (middleware + service both increment `analyses_used_this_month`) | `src/middleware/usagesQuotas.ts` + `src/module/analysis/analysis.service.ts` |
| MEDIUM | `GROQ_API_KEY_2` Zod error message says `GROQ_API_KEY is required` (copy-paste) | `src/config/env.ts:46` |
| MEDIUM | `cloudinary.ts` omits `.js` on `import env from "./env"` | `src/config/cloudinary.ts:2` |
| MEDIUM | `stripe.ts` omits `.js` on `import env from "../config/env"` | `src/lib/stripe.ts:2` |
| MEDIUM | Broken subscription mount in app.ts — no router passed | `src/app.ts:53` |
| MEDIUM | All 220 seed questions have `correct_answer: "a"` (likely intentional for dev) | `prisma/seed.ts` |
| MEDIUM | No jest config — `npm test` fails at runtime | root |
| LOW | `user.controller.ts` imports unused `number` from zod | `src/module/user/user.controller.ts:4` |
| LOW | `user.service.ts` imports unused `email` from zod | `src/module/user/user.service.ts:1` |
| LOW | Redundant Express type augmentation (both `declare module` and `declare global`) | `src/types/express.d.ts` |

## Response & Error Pattern

Every endpoint: `sendResponse(res, statusCode, success, message?, data?, error?)`. Omitted fields excluded from JSON. Controllers: `try/catch` + `next(error)`. Services: throw `AppError(message, statusCode)` for expected failures; `globalErrorHandler` converts. Unknown errors → 500.

## Not Built Yet

**Admin module** — no `src/module/admin/` exists. **Coding/Judge0 module** — skipped (no free code execution service). **Swagger docs** — swagger-jsdoc + swagger-ui-express in deps but not wired. **Tests** — jest + ts-jest + supertest in deps but no jest config or test files. **Winston** — declared but only `console.log` used. **No ESLint/Prettier/CI**.

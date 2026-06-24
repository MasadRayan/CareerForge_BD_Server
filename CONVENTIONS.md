# CareerForge BD — Coding Conventions & Architecture Memory

> Reference for building new modules. Established by the **User module**
> (`src/module/user/`). All future modules MUST follow these patterns for
> consistency. Last updated: 2026-06-24.

---

## 1. Project Stack & Shape

| Layer | Choice |
|---|---|
| Runtime | Node.js + Express 5 + TypeScript (strict) |
| Module system | **ESM** (`"type": "module"`) → imports MUST use `.js` extensions |
| DB | PostgreSQL via Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| Auth | Firebase Admin (`firebase-admin` v14, modular imports) |
| Validation | Zod |
| Dev runner | `tsx watch src/server.ts` |

**Key ESM rule:** every relative import ends in `.js` (even for `.ts` files):
```ts
import { prisma } from '../../lib/prisma.js'      // ✅
import { prisma } from '../../lib/prisma'         // ❌ runtime error
```
*Exception:* when the maintainer omits `.js` in a few spots, it works under tsx
but **always use `.js`** in new code.

---

## 2. Directory Structure (module-per-feature)

```
src/
├── app.ts                  ← Express app, middleware stack, route mounts
├── server.ts               ← http.Server, graceful shutdown, DB warmup
├── config/
│   ├── env.ts              ← Zod-validated process.env (single source of truth)
│   └── firebase.ts         ← firebase-admin singleton, exports firebaseAuth
├── lib/
│   └── prisma.ts           ← PrismaClient singleton via PrismaPg adapter
├── middleware/
│   ├── globalErrorHandler.ts  ← 4-arg error handler, uses sendResponse
│   ├── verifyFBToken.ts       ← verifies Firebase ID token, sets req.user
│   └── verifyAdmin.ts         ← RBAC gate (role === 'admin')
├── module/                    ← NOTE: "module" (singular), NOT "modules"
│   └── user/
│       ├── user.route.ts         ← Router + middleware wiring
│       ├── user.controller.ts    ← req → service → sendResponse
│       ├── user.service.ts       ← Prisma business logic, throws AppError
│       └── user.interface.ts     ← TS interfaces for payloads
├── types/
│   └── express.d.ts         ← Augments Express Request with user/decoded
└── utils/
    ├── sendResponse.ts      ← Standard JSON response helper
    └── AppError.ts          ← Error with statusCode
```

**To create a new module** (e.g. `cv`): create `src/module/cv/` with the same
4 files. Mount it in `app.ts`:
```ts
import { cvRouter } from './module/cv/cv.route.js'
app.use('/api/cv', cvRouter)
```

---

## 3. The 4 Files Every Module Has

### `*.route.ts` — routing
```ts
import { Router } from 'express'
import { cvController } from './cv.controller.js'
import { verifyFBToken } from '../../middleware/verifyFBToken.js'
import { verifyAdmin } from '../../middleware/verifyAdmin.js'

const router = Router()

// Public route (no auth)
router.post('/', cvController.create)

// Authenticated route
router.get('/', verifyFBToken, cvController.getAll)

// Admin-only route
router.get('/all-admin', verifyFBToken, verifyAdmin, cvController.getAllAdmin)

export const cvRouter = router
```

### `*.controller.ts` — HTTP layer
- Extracts `req.body` / `req.params` / `req.query`
- Calls exactly ONE service method
- Wraps in try/catch → `next(error)`
- Always ends with `sendResponse(...)`
- NEVER contains Prisma calls or business logic

```ts
const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cvService.createInDB(req.body)
    sendResponse(res, 201, true, 'CV created successfully', result)
  } catch (error) {
    next(error)
  }
}
```

### `*.service.ts` — business logic
- All Prisma calls live here
- Throws `AppError` for expected failures (404, 400, conflict)
- Exports an object of named functions
```ts
import { prisma } from '../../lib/prisma.js'
import AppError from '../../utils/AppError.js'

const getById = async (id: string) => {
  const record = await prisma.cVs.findUnique({ where: { id } })
  if (!record) throw new AppError('Not found', 404)
  return record
}

export const cvService = { getById }
```

### `*.interface.ts` — payload types
```ts
export interface CreateCVPayload {
  user_id: string
  file_url: string
  raw_text: string
}
```

---

## 4. Response & Error Conventions

### `sendResponse` — every endpoint ends with this
```ts
sendResponse(res, statusCode, success, message?, data?, error?)
```
Omitting a field excludes it from the JSON (no `null`s).

### `AppError` — for expected/known failures
```ts
throw new AppError('User not found', 404)
```
The `globalHandler` turns it into the correct status code automatically.
Unexpected errors fall through to 500.

**Controller error contract:** controllers ALWAYS use try/catch + `next(error)`.
Never `sendResponse` for errors inside a controller — throw or forward.

---

## 5. Auth & Request Identity

After `verifyFBToken`, the request has:
- `req.decoded` — full Firebase `DecodedIdToken`
- `req.user` — `{ id, name, email, role }` (from DB)

**IMPORTANT (security):** never put identity (email/id) in the URL path.
Use `req.user` as the source of truth:
```ts
// ✅ Correct — identity from token
router.get('/me', verifyFBToken, controller.getMe)
// controller: const user = await service.getById(req.user!.id)

// ❌ Wrong — IDOR vulnerability
router.get('/me/:email', verifyFBToken, controller.getByEmail)
```

**Middleware that denies access MUST return (not fall through):**
```ts
if (req.user?.role !== 'admin') {
  sendResponse(res, 403, false, 'Forbidden')
  return          // ← REQUIRED
}
next()
```

---

## 6. Prisma Conventions

- Import the singleton: `import { prisma } from '../../lib/prisma.js'`
- Client is generated to `generated/prisma` — already in tsconfig `include`
- Schema is multi-file under `prisma/schema/*.prisma` (merged automatically)
- `@db.Text` on large text fields (`raw_text`, `description`, `code`)
- `@@index` on all FK columns; `@@map` for snake_case table names
- `onDelete: Cascade` on user-owned relations (supports account deletion)

---

## 7. Naming

- Files: `camelCase.route.ts`, `user.controller.ts` (module name prefix)
- Exports: named exports (`export const userService = {...}`), router as `*Router`
- Functions: `verbNounInDB` (service) / `verbNoun` (controller)
- DB accessors: `*FromDB` / `*IntoDB` suffixes seen in user module

---

## 8. Known Deviations From planning.md (as of 2026-06-24)

| Area | planning.md | Actual | Status |
|---|---|---|---|
| Users PK | Firebase UID | `uuid()` + lookup by email | Decide deliberately |
| Folder | `src/modules/` (plural) | `src/module/` (singular) | Intentional, keep |
| Auth route | `POST /api/auth/sync` (token) | `POST /api/users/register` (public) | Needs Firebase verify |
| User routes | `/me` from token | `/me/:email` path param | IDOR — fix |
| RBAC | `requireRole()` factory | `verifyAdmin` middleware | OK |
| Quota middleware | `quota.middleware.ts` | not built | Sprint 2 |
| Logger | Winston | console only | Add later |

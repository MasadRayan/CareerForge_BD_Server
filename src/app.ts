import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import env from './config/env.js'
import { userRouter } from './module/user/user.route.js';
import { jobDescriptionRouter } from './module/jobDescription/jobDescription.route.js';
import { cvRouter } from './module/cv/cv.route.js';
import globalHandler from './middleware/globalErrorHandler.js';
import limiter from './middleware/ratelimit.js';

// ─── Route Imports (uncomment as each module is built) ───────
// import authRoutes from './modules/users/users.routes.js'
// import cvRoutes from './modules/cv/cv.routes.js'
// import jdRoutes from './modules/jobDescriptions/jobDescriptions.routes.js'
// import analysisRoutes from './modules/analysis/analysis.routes.js'
// import roadmapRoutes from './modules/roadmap/roadmap.routes.js'
// import quizRoutes from './modules/quiz/quiz.routes.js'
// import codingRoutes from './modules/coding/coding.routes.js'
// import behavioralRoutes from './modules/behavioral/behavioral.routes.js'
// import readinessRoutes from './modules/readiness/readiness.routes.js'
// import paymentRoutes from './modules/payments/payments.routes.js'
// import adminRoutes from './modules/admin/admin.routes.js'

const app: Application = express()

app.use(helmet())
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use('/api',limiter)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'CareerForge BD API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})
// ─── API Routes ───────────────────────────────────────────────
// app.use('/api/auth', authRoutes)
// app.use('/api/cv', cvRoutes)
// app.use('/api/jd', jdRoutes)
// app.use('/api/analysis', analysisRoutes)
// app.use('/api/roadmap', roadmapRoutes)
// app.use('/api/quiz', quizRoutes)
// app.use('/api/coding-problems', codingRoutes)
// app.use('/api/behavioral-questions', behavioralRoutes)
// app.use('/api/readiness-score', readinessRoutes)
// app.use('/api/payments', paymentRoutes)
// app.use('/api/admin', adminRoutes)

app.use("/api/users", userRouter)
app.use("/api/jd", jobDescriptionRouter)
app.use("/api/cv", cvRouter)

// ─── 404 Handler ──────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})
app.use(globalHandler)

export default app
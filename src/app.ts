import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import env from './config/env.js'
import { userRouter } from './module/user/user.route.js';
import { jobDescriptionRouter } from './module/jobDescription/jobDescription.route.js';
import { cvRouter } from './module/cv/cv.route.js';
import { skillsRouter } from './module/skills/skills.route.js';
import { analysisRouter } from './module/analysis/analysis.route.js';
import { roadmapRouter } from './module/roadmap/roadmap.route.js';
import { quizRouter } from './module/quiz/quiz.route.js';
import { behavioralRouter } from './module/behavioral/behavioral.route.js';
import { readinessRouter } from './module/readiness/readiness.route.js';
import { notificationRouter } from './module/notification/notification.route.js';
import { subscriptionRouter } from './module/payment/payment.route.js';
import { analyticsRouter } from './module/analytics/analytics.route.js';
import { jobsRouter } from './module/jobs/jobs.route.js';
import { certificateRouter } from './module/certificate/certificate.route.js';
import globalHandler from './middleware/globalErrorHandler.js';
import limiter from './middleware/ratelimit.js';


const app: Application = express()

app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(helmet({ crossOriginOpenerPolicy: false }))
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.post("/api/subscription/webhook", express.raw({ type: "application/json" }))

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use('/api',limiter)
app.get(['/favicon.png', '/favicon.ico'], (_req: Request, res: Response) => {
  res.status(204).end()
})
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'CareerForge BD API is running',
    author:"masad Rayan",
    timestamp: new Date().toISOString(),
  })
})
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'CareerForge BD API is running',
    author:"masad Rayan",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

app.use("/api/users", userRouter)
app.use("/api/jd", jobDescriptionRouter)
app.use("/api/cv", cvRouter)
app.use("/api/cv", skillsRouter)
app.use("/api/analysis", analysisRouter)
app.use("/api/roadmap", roadmapRouter)
app.use("/api/quiz", quizRouter)
app.use("/api/behavioral-questions", behavioralRouter)
app.use("/api/readiness-score", readinessRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/subscription", subscriptionRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/certificate", certificateRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})
app.use(globalHandler)

export default app
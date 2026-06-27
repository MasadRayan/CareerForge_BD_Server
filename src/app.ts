import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import env from './config/env.js'
import { userRouter } from './module/user/user.route.js';
import { jobDescriptionRouter } from './module/jobDescription/jobDescription.route.js';
import { cvRouter } from './module/cv/cv.route.js';
import { analysisRouter } from './module/analysis/analysis.route.js';
import globalHandler from './middleware/globalErrorHandler.js';
import limiter from './middleware/ratelimit.js';


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

app.use("/api/users", userRouter)
app.use("/api/jd", jobDescriptionRouter)
app.use("/api/cv", cvRouter)
app.use("/api/analysis", analysisRouter)

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})
app.use(globalHandler)

export default app
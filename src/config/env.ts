import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../../.env') })

const envSchema = z.object({
  // Server
  PORT: z.string().default('5000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().min(1, 'FIREBASE_CLIENT_EMAIL is required'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'FIREBASE_PRIVATE_KEY is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // SSLCommerz
  SSLCOMMERZ_STORE_ID: z.string().min(1, 'SSLCOMMERZ_STORE_ID is required'),
  SSLCOMMERZ_STORE_PASS: z.string().min(1, 'SSLCOMMERZ_STORE_PASS is required'),
  SSLCOMMERZ_IS_LIVE: z
    .string()
    .transform((val) => val === 'true')
    .default(false),

  // Judge0
  JUDGE0_BASE_URL: z.string().url('JUDGE0_BASE_URL must be a valid URL'),

  // Email
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),

  // Frontend
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  parsed.error.issues.forEach((err : any) => {
    console.error(`   ${err.path.join('.')}: ${err.message}`)
  })
  process.exit(1)
}

export default parsed.data
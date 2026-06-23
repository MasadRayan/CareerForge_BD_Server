import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import env from './env.js'

// ─── Initialize Firebase Admin (singleton) ───────────────────
// `getApps()` guard prevents re-initialization during hot reloads
// (tsx watch) or repeated imports in tests.
if (getApps().length === 0) {
  // `.env` stores the private key with literal `\n` sequences; the
  // Admin SDK expects real newlines, so convert them here.
  const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')

  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
}

const firebaseAuth = getAuth()

export { firebaseAuth }

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { ensureDb } from './middleware/ensureDb.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import apiRouter from './routes/index.js'
import { sendSuccess } from './utils/apiResponse.js'

export function createApp() {
  const app = express()

  // Trust Vercel / reverse-proxy so secure cookies and auth rate-limit IPs work
  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  )
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  app.use(cookieParser())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // Rate limiting is applied only on auth attempt routes (login, invite, password reset).
  // Do not globally limit authenticated API traffic for paying users.

  // Liveness only — no DB (fast cold-start / platform checks)
  app.get('/health', (_req, res) => {
    return sendSuccess(res, {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  })

  app.use(ensureDb)
  app.use('/api/v1', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

/** Default export for Vercel Express detection (`src/app.ts`). */
const app = createApp()
export default app

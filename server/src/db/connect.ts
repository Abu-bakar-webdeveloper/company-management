import mongoose from 'mongoose'
import { env } from '../config/env.js'

const MAX_RETRIES = process.env.VERCEL ? 2 : 5
const RETRY_DELAY_MS = process.env.VERCEL ? 1000 : 3000

/** Shared across warm serverless invocations */
let connectPromise: Promise<void> | null = null

async function connectWithRetry(): Promise<void> {
  let attempt = 0

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI)
      console.log('MongoDB connected')
      return
    } catch (err) {
      attempt++
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}): ${message}`)

      if (attempt >= MAX_RETRIES) {
        throw new Error('Could not connect to MongoDB after multiple attempts')
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
    }
  }
}

/**
 * Idempotent MongoDB connect. Safe for serverless (caches in-flight + warm connections).
 */
export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return
  }

  if (!connectPromise) {
    connectPromise = connectWithRetry().catch((err) => {
      connectPromise = null
      throw err
    })
  }

  await connectPromise
}

export async function disconnectDB(): Promise<void> {
  connectPromise = null
  await mongoose.disconnect()
  console.log('MongoDB disconnected')
}

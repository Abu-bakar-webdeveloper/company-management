import 'dotenv/config'
import app from './app.js'
import { env, isPushConfigured } from './config/env.js'
import { connectDB, disconnectDB } from './db/connect.js'

export default app

async function start() {
  await connectDB()

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`)
    console.log(`Health check: http://localhost:${env.PORT}/health`)
    console.log(
      isPushConfigured()
        ? 'Web push: configured (VAPID keys loaded)'
        : 'Web push: disabled — set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env',
    )
  })

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

// Local / traditional host only — Vercel uses the default export as a Function
if (!process.env.VERCEL) {
  start().catch((err) => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
}

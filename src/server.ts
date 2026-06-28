import http from 'http'
import app from './app.js'
import env from './config/env.js'
import { prisma } from './lib/prisma.js'

const PORT = env.PORT

const server = http.createServer(app)
let serverListening = false

async function assertDatabaseConnection(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection established')
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
    throw error
  }
}

function gracefulShutdown(signal: string, exitCode: number = 0): void {
  console.log(`\n${signal} received — shutting down gracefully...`)

  const cleanup = async () => {
    await prisma.$disconnect()
    console.log('✅ Prisma disconnected. Bye.')
    process.exit(exitCode)
  }

  if (serverListening) {
    server.close(async (err) => {
      if (err) {
        console.error('Error closing HTTP server:', err)
        process.exit(1)
      }
      await cleanup()
    })
  } else {
    // Server never started listening — skip server.close()
    void cleanup()
  }

  // Force exit if graceful shutdown stalls
  setTimeout(() => {
    console.error('Forcing shutdown after timeout.')
    process.exit(1)
  }, 10_000).unref()
}

async function startServer(): Promise<void> {
  try {
    await assertDatabaseConnection()

    server.listen(PORT, () => {
      serverListening = true
      console.log('─────────────────────────────────────────────')
      console.log(`🚀 Server     : http://localhost:${PORT}`)
      console.log(`❤️  Health     : http://localhost:${PORT}/health`)
      console.log(`📄 API Docs   : http://localhost:${PORT}/api-docs`)
      console.log(`🌍 Environment: ${env.NODE_ENV}`)
      console.log('─────────────────────────────────────────────')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// ─── Process Signal Handlers ──────────────────────────────────
;['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal, 0))
})

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Promise Rejection:', reason)
  gracefulShutdown('unhandledRejection', 1)
})

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error)
  gracefulShutdown('uncaughtException', 1)
})

void startServer()
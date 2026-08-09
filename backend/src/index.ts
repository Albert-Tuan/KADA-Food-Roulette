import 'dotenv/config'
import express, { Express, Request, Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { corsMiddleware } from './middleware/cors.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './modules/auth/auth.routes.js'
import partnerRoutes from './modules/partner/partner.routes.js'

const app: Express = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())

// CORS
app.use(corsMiddleware)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging (dev mode)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Food Roulette API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/partners', partnerRoutes)

// TODO: Add more routes as they are implemented
// app.use('/api/v1/users', userRoutes)
// app.use('/api/v1/restaurants', restaurantRoutes)
// app.use('/api/v1/spins', spinRoutes)
// app.use('/api/v1/lockets', locketRoutes)
// app.use('/api/v1/groups', groupRoutes)

// 404 handler
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🍜 Food Roulette API Server                         ║
║   Running on: http://localhost:${PORT}                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
║                                                       ║
║   Endpoints:                                          ║
║   • GET  /health              - Health check          ║
║   • POST /api/v1/auth/register - Register              ║
║   • POST /api/v1/auth/login    - Login                 ║
║   • GET  /api/v1/auth/me      - Get current user      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `)
})

export default app

import 'dotenv/config'
import express, { Express, Request, Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { corsMiddleware } from './middleware/cors.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { requestContext } from './middleware/requestContext.js'
import authRoutes from './modules/auth/auth.routes.js'
import partnerRoutes from './modules/partner/partner.routes.js'
import rouletteRoutes from './modules/roulette/roulette.routes.js'
import restaurantRoutes from './modules/restaurants/restaurants.routes.js'
import groupRoutes from './modules/groups/groups.routes.js'
import locketRoutes from './modules/lockets/lockets.routes.js'
import preferenceRoutes from './modules/preferences/preferences.routes.js'
import circleRoutes from './modules/circle/circle.routes.js'
import menuRoutes from './modules/menu/menu.routes.js'
import stewardRoutes from './modules/steward/steward.routes.js'
import userRoutes from './modules/users/users.routes.js'
import profileRoutes from './modules/profile/profile.routes.js'
import friendsRoutes from './modules/friends/friends.routes.js'
import notificationRoutes from './modules/notifications/notifications.routes.js'
import placesRoutes from './modules/places/places.routes.js'

const app: Express = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: false, crossOriginEmbedderPolicy: false }))
app.use(requestContext)

import path from 'path';

// CORS
app.use(corsMiddleware)

// Serve uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Root & Health checks for Render Load Balancer
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Food Roulette API is Live',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Food Roulette API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/partners', partnerRoutes)
app.use('/api/v1/spins', rouletteRoutes)
app.use('/api/v1/restaurants', restaurantRoutes)
app.use('/api/v1/groups', groupRoutes)
app.use('/api/v1/lockets', locketRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/preferences', preferenceRoutes)
app.use('/api/v1/circles', circleRoutes)
app.use('/api/v1/menu', menuRoutes)
app.use('/api/v1/steward', stewardRoutes)
app.use('/api/v1/profile', profileRoutes)
app.use('/api/v1/profiles', profileRoutes)
app.use('/api/v1/friends', friendsRoutes)
app.use('/api/v1/notifications', notificationRoutes)

import reviewRoutes from './modules/reviews/reviews.routes'
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/places', placesRoutes)

// 404 handler
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🍜 Food Roulette API Server                             ║
║   Running on: http://localhost:${PORT}                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                           ║
║   Endpoints:                                              ║
║   • GET  /health              - Health check               ║
║   • POST /api/v1/auth/register - Register                ║
║   • POST /api/v1/auth/login    - Login                   ║
║   • GET  /api/v1/auth/me     - Get current user         ║
║   • POST /api/v1/partners    - Partner registration      ║
║   • POST /api/v1/spins        - Personal spin            ║
║   • POST /api/v1/groups       - Create group            ║
║   • POST /api/v1/lockets      - Upload locket           ║
║   • GET  /api/v1/restaurants  - Search restaurants      ║
║   • GET  /api/v1/preferences  - Get preferences          ║
║   • GET  /api/v1/circles      - Get circles             ║
║   • POST /api/v1/menu/parse   - Parse menu              ║
║   • GET  /api/v1/steward      - Steward dashboard       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `)
})

export default app

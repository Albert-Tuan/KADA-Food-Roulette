import cors from 'cors'
import { Request, Response, NextFunction } from 'express'

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:19006',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8081',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

export const corsMiddleware = cors({
  origin: true, // Reflect request origin for local dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
});

export const handleCors = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
}

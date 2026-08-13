import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types/index.js'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-min-32-chars'

interface TokenPayload extends JwtPayload {
  exp?: number
  type?: string
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

export const generateRefreshToken = (payload: JwtPayload): string => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_SECRET,
    { expiresIn } as jwt.SignOptions
  )
}

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export const decodeToken = (token: string): TokenPayload | null => {
  return jwt.decode(token) as TokenPayload | null
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) return true
    return Date.now() >= decoded.exp * 1000
  } catch {
    return true
  }
}

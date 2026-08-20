import cors, { type CorsOptions } from 'cors'
import type { RequestHandler } from 'express'

const DEVELOPMENT_PORTS = new Set(['5173', '8081', '8082', '19006'])
const DEVELOPMENT_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'X-Device-ID',
  'X-Captured-At',
  'X-Device-Hash',
  'device-hash',
  'captured-at',
  'Accept',
  'Accept-Language',
  'Origin',
]

function configuredOrigins(environment: NodeJS.ProcessEnv): Set<string> {
  const origins = [
    ...(environment.CLIENT_URLS ?? '').split(','),
    ...(environment.CORS_ORIGIN ?? '').split(','),
    environment.CLIENT_URL ?? '',
    environment.FRONTEND_URL ?? '',
  ]
    .map((origin) => origin.trim())
    .filter(Boolean)
  return new Set(origins)
}

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false
  }
  return octets[0] === 10
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168)
}

function isDevelopmentOrigin(origin: string): boolean {
  try {
    const parsed = new URL(origin)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:')
      && (DEVELOPMENT_PORTS.has(parsed.port) || parsed.port === '' || DEVELOPMENT_HOSTS.has(parsed.hostname) || isPrivateIpv4(parsed.hostname))
  } catch {
    return false
  }
}

export function createCorsOptions(environment: NodeJS.ProcessEnv = process.env): CorsOptions {
  const allowedOrigins = configuredOrigins(environment)

  return {
    origin: (origin, callback) => {
      // Always allow requests without origin (React Native native apps, server-to-server)
      if (!origin) {
        callback(null, true)
        return
      }
      if (
        allowedOrigins.has('*')
        || allowedOrigins.has(origin)
        || isDevelopmentOrigin(origin)
        || origin.includes('localhost')
        || origin.includes('127.0.0.1')
        || origin.endsWith('.vercel.app')
        || origin.endsWith('.onrender.com')
      ) {
        callback(null, true)
        return
      }
      // Relaxed fallback for client applications
      callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ALLOWED_HEADERS,
  }
}

export function createCorsMiddleware(environment: NodeJS.ProcessEnv = process.env): RequestHandler {
  return cors(createCorsOptions(environment))
}

export const corsMiddleware = createCorsMiddleware()
export const handleCors = corsMiddleware

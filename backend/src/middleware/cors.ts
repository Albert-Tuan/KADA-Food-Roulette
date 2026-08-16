import { Request, Response, NextFunction } from 'express';

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

export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Reflect request origin for local development & allowed origins
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
  
  // Allow all requested headers dynamically or fallback to comprehensive list
  const requestedHeaders = req.headers['access-control-request-headers'];
  if (requestedHeaders) {
    res.setHeader('Access-Control-Allow-Headers', requestedHeaders);
  } else {
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Device-ID, x-device-id, X-Captured-At, x-captured-at, x-device-hash, x-request-id, x-client-platform, x-client-version'
    );
  }

  res.setHeader('Access-Control-Expose-Headers', 'set-cookie');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};

export const handleCors = corsMiddleware;

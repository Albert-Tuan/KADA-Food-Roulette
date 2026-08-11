import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'food-roulette-super-secret-jwt-key-2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        if (process.env.NODE_ENV !== 'production') {
          // Dev fallback for demo tokens
          req.user = {
            id: 'demo_user_123',
            email: 'demo@foodroulette.app',
            role: 'USER',
          };
          return next();
        }
        return res.status(403).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
      }
      req.user = user;
      next();
    });
  } else if (process.env.NODE_ENV !== 'production') {
    // Dev guest fallback for testing without active login session
    req.user = {
      id: 'demo_user_123',
      email: 'demo@foodroulette.app',
      role: 'USER',
    };
    next();
  } else {
    res.status(401).json({ error: 'Yêu cầu xác thực tài khoản (chưa truyền Token).' });
  }
};

function readVerifiedUser(req: Request): AuthRequest['user'] {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return undefined;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return undefined;

  const payload = jwt.verify(token, JWT_SECRET);
  if (
    typeof payload === 'string'
    || typeof payload.id !== 'string'
    || typeof payload.email !== 'string'
    || typeof payload.role !== 'string'
  ) {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }

  return { id: payload.id, email: payload.email, role: payload.role };
}

export const requireJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = readVerifiedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_REQUIRED', message: 'Bạn cần đăng nhập để tiếp tục.' },
      });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_INVALID', message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' },
    });
  }
};

export const optionalJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) return next();

  try {
    const user = readVerifiedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_INVALID', message: 'Phiên đăng nhập không hợp lệ.' },
      });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_INVALID', message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' },
    });
  }
};

import type { Response } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { logger } from '../../shared/utils/logger.js';
import { UserApiError } from './users.errors.js';
import { usersService } from './users.service.js';
import { parseUpdateProfile, validatePublicId } from './users.validation.js';

function sendError(res: Response, error: unknown, requestId?: string) {
  if (error instanceof UserApiError) {
    logger.warn('profile_request_rejected', { requestId, code: error.code, statusCode: error.statusCode });
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
  }
  logger.error('profile_request_failed', { requestId, code: 'PROFILE_INTERNAL', statusCode: 500 });
  return res.status(500).json({
    success: false,
    error: { code: 'PROFILE_INTERNAL', message: 'Không thể xử lý profile lúc này.' },
  });
}

export const usersController = {
  getMe: async (req: AuthRequest, res: Response) => {
    try {
      return res.json({ success: true, data: await usersService.getMyProfile(req.user!.id) });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  updateMe: async (req: AuthRequest, res: Response) => {
    try {
      const input = parseUpdateProfile(req.body as Record<string, unknown>);
      const data = await usersService.updateMyProfile(req.user!.id, input);
      logger.info('profile_updated', { requestId: req.requestId });
      return res.json({ success: true, data });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  getPublic: async (req: AuthRequest, res: Response) => {
    try {
      const publicId = validatePublicId(req.params.publicId);
      return res.json({ success: true, data: await usersService.getPublicProfile(publicId) });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },
};

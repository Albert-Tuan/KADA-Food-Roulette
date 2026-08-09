import type { Response } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { logger } from '../../shared/utils/logger.js';
import { LocketApiError } from './lockets.errors.js';
import { verifyMediaSignature } from './lockets.mediaAccess.js';
import { locketsService, serializeLocket } from './lockets.service.js';
import { locketStorage } from './lockets.storage.js';
import {
  parseCreateLocket,
  parseFeedType,
  parseRouteParam,
  parseUpdateLocket,
  validateImageFile,
} from './lockets.validation.js';

function sendError(res: Response, error: unknown, requestId?: string) {
  if (error instanceof LocketApiError) {
    logger.warn('locket_request_rejected', { requestId, code: error.code, statusCode: error.statusCode });
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message },
    });
  }

  logger.error('locket_request_failed', { requestId, code: 'LOCKET_INTERNAL', statusCode: 500 });
  return res.status(500).json({
    success: false,
    error: { code: 'LOCKET_INTERNAL', message: 'Không thể xử lý Locket lúc này.' },
  });
}

export const locketsController = {
  getFeed: async (req: AuthRequest, res: Response) => {
    try {
      const type = parseFeedType(req.query.type);
      const data = await locketsService.getFeed(req.user!.id, type);
      return res.json({ success: true, data, meta: { limit: 50, has_more: false } });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  getMine: async (req: AuthRequest, res: Response) => {
    try {
      const data = await locketsService.getFeed(req.user!.id, 'MINE');
      return res.json({ success: true, data, meta: { limit: 50, has_more: false } });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const id = parseRouteParam(req.params.id, 'Mã locket');
      const record = await locketsService.getById(id, req.user?.id);
      return res.json({ success: true, data: serializeLocket(record, req.user?.id) });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      validateImageFile(req.file);
      const input = parseCreateLocket(req.body as Record<string, unknown>, {
        deviceHash: req.header('x-device-id'),
        capturedAt: req.header('x-captured-at'),
      });
      const record = await locketsService.create(req.user!.id, input, req.file);
      logger.info('locket_created', {
        requestId: req.requestId,
        locketId: record.id,
        visibility: record.visibility,
        storageMode: locketStorage.mode,
        exifStripped: record.exifStripped,
      });
      return res.status(201).json({ success: true, data: serializeLocket(record, req.user!.id) });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const id = parseRouteParam(req.params.id, 'Mã locket');
      const input = parseUpdateLocket(req.body as Record<string, unknown>);
      const record = await locketsService.update(id, req.user!.id, input);
      logger.info('locket_updated', { requestId: req.requestId, locketId: record.id });
      return res.json({ success: true, data: serializeLocket(record, req.user!.id) });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    try {
      const id = parseRouteParam(req.params.id, 'Mã locket');
      await locketsService.delete(id, req.user!.id);
      logger.info('locket_deleted', { requestId: req.requestId, locketId: id });
      return res.status(204).send();
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  getMedia: async (req: AuthRequest, res: Response) => {
    try {
      const key = parseRouteParam(req.params.key, 'Mã ảnh');
      const hasValidSignature = verifyMediaSignature(
        key,
        req.query.expires,
        req.query.signature,
      );
      const media = await locketsService.getMedia(key, req.user?.id, hasValidSignature);
      res.setHeader('content-type', media.mimeType);
      res.setHeader('cache-control', 'private, max-age=300');
      return res.send(media.buffer);
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },
};

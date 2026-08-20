import { Readable } from 'node:stream';
import type { Response } from 'express';
import type { AuthRequest } from '../../shared/middleware/auth.middleware.js';
import { logger } from '../../shared/utils/logger.js';
import { LocketApiError } from './lockets.errors.js';
import { mediaCacheControl, verifyMediaSignature } from './lockets.mediaAccess.js';
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
      const userId = req.user?.id || '';
      const data = await locketsService.getFeed(userId, type);
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
      return res.json({ success: true, data: await serializeLocket(record, req.user?.id) });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    const startedAt = Date.now();
    try {
      let file = req.file;
      if (!file && req.body) {
        const rawBase64 = (typeof req.body.image_base64 === 'string' ? req.body.image_base64 : undefined)
          || (typeof req.body.image === 'string' && req.body.image.startsWith('data:') ? req.body.image : undefined)
          || (typeof req.body.image === 'string' && req.body.image.length > 100 ? req.body.image : undefined);
        if (rawBase64) {
          const mimeType = rawBase64.includes('image/png') ? 'image/png' : 'image/jpeg';
          const base64Data = rawBase64.includes(',') ? rawBase64.split(',')[1] : rawBase64;
          const buffer = Buffer.from(base64Data, 'base64');
          file = {
            fieldname: 'image',
            originalname: `locket.${mimeType === 'image/png' ? 'png' : 'jpg'}`,
            encoding: '7bit',
            mimetype: mimeType,
            buffer,
            size: buffer.length,
            destination: '',
            filename: '',
            path: '',
            stream: Readable.from(buffer),
          };
        }
      }

      validateImageFile(file);
      const input = parseCreateLocket(req.body as Record<string, unknown>, {
        deviceHash: req.header('x-device-id'),
        capturedAt: req.header('x-captured-at'),
      });
      const userId = req.user!.id;
      const record = await locketsService.create(userId, input, file);
      logger.info('locket_created', {
        requestId: req.requestId,
        locketId: record.id,
        visibility: record.visibility,
        storageMode: locketStorage.mode,
        exifStripped: record.exifStripped,
        inputBytes: file.size,
        outputBytes: record.imageBytes,
        durationMs: Date.now() - startedAt,
      });
      return res.status(201).json({
        success: true,
        data: await serializeLocket(record, req.user!.id),
      });
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
      return res.json({ success: true, data: await serializeLocket(record, req.user!.id) });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  like: async (req: AuthRequest, res: Response) => {
    try {
      const id = parseRouteParam(req.params.id, 'Mã locket');
      const data = await locketsService.like(id, req.user!.id);
      logger.info('locket_liked', { requestId: req.requestId, locketId: id });
      return res.status(201).json({ success: true, data });
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },

  unlike: async (req: AuthRequest, res: Response) => {
    try {
      const id = parseRouteParam(req.params.id, 'Mã locket');
      const data = await locketsService.unlike(id, req.user!.id);
      logger.info('locket_unliked', { requestId: req.requestId, locketId: id });
      return res.json({ success: true, data });
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
    const startedAt = Date.now();
    try {
      const namespace = parseRouteParam(req.params.namespace, 'Namespace ảnh');
      const userId = parseRouteParam(req.params.userId, 'Mã người dùng');
      const locketId = parseRouteParam(req.params.locketId, 'Mã locket');
      const fileName = parseRouteParam(req.params.fileName, 'Tên ảnh');
      const path = `${namespace}/${userId}/${locketId}/${fileName}`;
      const hasValidSignature = verifyMediaSignature(
        path,
        req.query.expires,
        req.query.signature,
      );
      const media = await locketsService.getMedia(path, req.user?.id, hasValidSignature);
      res.setHeader('content-type', media.mimeType);
      res.setHeader('content-length', media.buffer.length);
      res.setHeader('cache-control', mediaCacheControl(media.visibility));
      res.setHeader('vary', 'Authorization');
      logger.info('locket_media_served', {
        requestId: req.requestId,
        visibility: media.visibility,
        storageMode: locketStorage.mode,
        bytes: media.buffer.length,
        durationMs: Date.now() - startedAt,
      });
      return res.send(media.buffer);
    } catch (error) {
      return sendError(res, error, req.requestId);
    }
  },
};

import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const responseHelper = {
  success<T>(res: Response, data: T, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  },

  created<T>(res: Response, data: T) {
    return res.status(201).json({
      success: true,
      data,
    });
  },

  successWithMessage(res: Response, message: string, data?: Record<string, unknown> | object) {
    return res.status(200).json({
      success: true,
      message,
      ...(data && typeof data === 'object' ? data : {}),
    });
  },
  },

  error(res: Response, message: string, statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  },

  paginated<T>(
    res: Response,
    data: T[],
    pagination: { page: number; limit: number; total: number; totalPages: number }
  ) {
    return res.status(200).json({
      success: true,
      data,
      meta: pagination,
    });
  },
};

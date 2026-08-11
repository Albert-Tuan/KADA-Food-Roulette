import sharp from 'sharp';
import { LocketApiError } from './lockets.errors.js';

const MAX_INPUT_PIXELS = 40_000_000;
const ORIGINAL_MAX_EDGE = 2_048;
const THUMBNAIL_EDGE = 480;

export interface ProcessedLocketImages {
  original: Buffer;
  thumbnail: Buffer;
  width: number;
  height: number;
  originalBytes: number;
  thumbnailBytes: number;
  mimeType: 'image/jpeg';
  exifStripped: true;
}

function imagePipeline(buffer: Buffer) {
  return sharp(buffer, {
    failOn: 'error',
    limitInputPixels: MAX_INPUT_PIXELS,
  }).rotate();
}

export async function processLocketImage(buffer: Buffer): Promise<ProcessedLocketImages> {
  try {
    const metadata = await imagePipeline(buffer).metadata();
    if (!metadata.format || !['jpeg', 'png'].includes(metadata.format) || (metadata.pages ?? 1) !== 1) {
      throw new LocketApiError('LOCKET_IMAGE_INVALID', 'Ảnh phải là JPEG hoặc PNG một khung hình.');
    }

    const [originalResult, thumbnailResult] = await Promise.all([
      imagePipeline(buffer)
        .resize({
          width: ORIGINAL_MAX_EDGE,
          height: ORIGINAL_MAX_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 88, mozjpeg: true })
        .toBuffer({ resolveWithObject: true }),
      imagePipeline(buffer)
        .resize({
          width: THUMBNAIL_EDGE,
          height: THUMBNAIL_EDGE,
          fit: 'cover',
          position: 'centre',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer({ resolveWithObject: true }),
    ]);

    return {
      original: originalResult.data,
      thumbnail: thumbnailResult.data,
      width: originalResult.info.width,
      height: originalResult.info.height,
      originalBytes: originalResult.info.size,
      thumbnailBytes: thumbnailResult.info.size,
      mimeType: 'image/jpeg',
      exifStripped: true,
    };
  } catch (error) {
    if (error instanceof LocketApiError) throw error;
    throw new LocketApiError('LOCKET_IMAGE_PROCESSING_FAILED', 'Ảnh không thể được xử lý an toàn.', 400);
  }
}

import { describe, expect, it } from 'vitest';
import { LocketApiError } from './lockets.errors.js';
import { parseCreateLocket, parseUpdateLocket, validateImageFile } from './lockets.validation.js';

const deviceHash = 'a'.repeat(64);
const now = new Date('2026-08-09T09:00:00.000Z');

describe('Locket request validation', () => {
  it('accepts the minimal Taste Board payload', () => {
    const result = parseCreateLocket({
      visibility: 'FRIENDS',
      latitude: '10.7769',
      longitude: '106.7009',
    }, {
      deviceHash,
      capturedAt: '2026-08-09T08:59:30.000Z',
    }, now);

    expect(result).toMatchObject({
      visibility: 'FRIENDS',
      dishName: undefined,
      rating: undefined,
      tags: undefined,
    });
  });

  it('continues to normalize legacy metadata when supplied', () => {
    const result = parseCreateLocket({
      dish_name: '  Bún bò Huế  ',
      restaurant_name: ' Bếp Huế ',
      rating: '5',
      tags: '["món Việt", "cay nhẹ"]',
      visibility: 'FRIENDS',
      latitude: '10.7769',
      longitude: '106.7009',
    }, {
      deviceHash,
      capturedAt: '2026-08-09T08:59:30.000Z',
    }, now);

    expect(result).toMatchObject({
      dishName: 'Bún bò Huế',
      restaurantName: 'Bếp Huế',
      rating: 5,
      tags: ['món Việt', 'cay nhẹ'],
      visibility: 'FRIENDS',
    });
  });

  it('rejects captures outside the 5-minute boundary', () => {
    expect(() => parseCreateLocket({
      latitude: '10', longitude: '106',
    }, {
      deviceHash,
      capturedAt: '2026-08-09T08:54:59.000Z',
    }, now)).toThrowError(LocketApiError);
  });

  it('rejects a MIME declaration that does not match magic bytes', () => {
    const file = {
      mimetype: 'image/jpeg',
      size: 8,
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    } as Express.Multer.File;
    expect(() => validateImageFile(file)).toThrowError('Nội dung ảnh không khớp');
  });

  it('rejects empty update payloads', () => {
    expect(() => parseUpdateLocket({})).toThrowError('Không có dữ liệu');
  });
});

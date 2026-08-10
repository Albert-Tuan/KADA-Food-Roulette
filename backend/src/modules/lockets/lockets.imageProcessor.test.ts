import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { processLocketImage } from './lockets.imageProcessor.js';

describe('Locket Sharp pipeline', () => {
  it('re-encodes JPEG, strips EXIF and creates a square thumbnail', async () => {
    const input = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: '#c68e17',
      },
    })
      .jpeg()
      .withExif({ IFD0: { Artist: 'should-not-survive' } })
      .toBuffer();

    const output = await processLocketImage(input);
    const originalMetadata = await sharp(output.original).metadata();
    const thumbnailMetadata = await sharp(output.thumbnail).metadata();

    expect(output).toMatchObject({
      width: 800,
      height: 600,
      mimeType: 'image/jpeg',
      exifStripped: true,
    });
    expect(originalMetadata.exif).toBeUndefined();
    expect(thumbnailMetadata).toMatchObject({ width: 480, height: 480, format: 'jpeg' });
  });

  it('rejects undecodable content', async () => {
    await expect(processLocketImage(Buffer.from('not-an-image'))).rejects.toMatchObject({
      code: 'LOCKET_IMAGE_PROCESSING_FAILED',
      statusCode: 400,
    });
  });
});

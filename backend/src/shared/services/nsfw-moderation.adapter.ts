/**
 * NSFW.js Adapter - Local NSFW image detection
 *
 * Reference: docs/decisions/001-ai-moderation.md §Image Moderation
 *
 * NOTE: NSFW.js is a TensorFlow.js model. Production deployment cần:
 *   - `npm install nsfwjs @tensorflow/tfjs-node`
 *   - Pre-download model weights
 *   - Worker thread để không block main thread
 *
 * For MVP, return clean verdict with TODO note để team integrate sau.
 */

import {
  ModerationProvider,
  ModerationVerdict,
} from './moderation.service';

export class NsfwAdapter implements ModerationProvider {
  readonly name = 'nsfw-js';

  /**
   * Stub implementation cho MVP.
   * Real implementation sẽ dùng nsfwjs package.
   *
   * TODO: Implement với nsfwjs khi deploy production
   *   const nsfw = await import('nsfwjs');
   *   const model = await nsfw.load();
   *   const predictions = await model.classify(imageBuffer);
   *   const pornScore = predictions.find(p => p.className === 'Porn')?.probability ?? 0;
   */
  async moderateImage(_imageUrl: string): Promise<ModerationVerdict> {
    // MVP stub - luôn return clean
    // Real implementation sẽ download image và chạy NSFW model
    return {
      flagged: false,
      category: null,
      confidence: 0,
      scores: {},
      reason: 'NSFW.js: stub mode (always clean) - configure nsfwjs for production',
    };
  }

  /** NSFW.js chỉ moderate images */
  async moderateText(_text: string): Promise<ModerationVerdict> {
    throw new Error('NSFW adapter does not support text moderation. Use OpenAI adapter.');
  }
}
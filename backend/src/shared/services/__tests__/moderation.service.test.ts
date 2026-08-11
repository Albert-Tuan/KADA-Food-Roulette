/**
 * Moderation Service - Unit Tests
 * Reference: docs/decisions/001-ai-moderation.md
 */

import { ModerationService, ModerationProvider, ModerationVerdict } from './moderation.service';

class StubProvider implements ModerationProvider {
  readonly name = 'stub';
  constructor(
    private readonly textVerdict: ModerationVerdict,
    private readonly imageVerdict: ModerationVerdict
  ) {}
  async moderateText(_text: string): Promise<ModerationVerdict> {
    return this.textVerdict;
  }
  async moderateImage(_imageUrl: string): Promise<ModerationVerdict> {
    return this.imageVerdict;
  }
}

class FailingProvider implements ModerationProvider {
  readonly name = 'failing';
  async moderateText(): Promise<ModerationVerdict> {
    throw new Error('API down');
  }
  async moderateImage(): Promise<ModerationVerdict> {
    throw new Error('API down');
  }
}

describe('ModerationService', () => {
  const cleanVerdict: ModerationVerdict = {
    flagged: false,
    category: null,
    confidence: 0,
    scores: {},
    reason: 'clean',
  };

  const flaggedVerdict = (confidence: number, category = 'profanity' as any): ModerationVerdict => ({
    flagged: true,
    category,
    confidence,
    scores: { [category]: confidence },
    reason: `flagged (${confidence})`,
  });

  describe('action thresholds', () => {
    it('returns pass for confidence < 0.7', async () => {
      const svc = new ModerationService(
        new StubProvider(flaggedVerdict(0.5), cleanVerdict),
        new StubProvider(cleanVerdict, cleanVerdict)
      );
      const result = await svc.moderate({ contentType: 'review', contentId: 'r1', text: 'x' });
      expect(result.action).toBe('pass');
    });

    it('returns flag for 0.7 <= confidence < 0.9', async () => {
      const svc = new ModerationService(
        new StubProvider(flaggedVerdict(0.8), cleanVerdict),
        new StubProvider(cleanVerdict, cleanVerdict)
      );
      const result = await svc.moderate({ contentType: 'review', contentId: 'r1', text: 'x' });
      expect(result.action).toBe('flag');
      expect(result.flagged).toBe(true);
    });

    it('returns auto_hide for confidence >= 0.9', async () => {
      const svc = new ModerationService(
        new StubProvider(flaggedVerdict(0.95), cleanVerdict),
        new StubProvider(cleanVerdict, cleanVerdict)
      );
      const result = await svc.moderate({ contentType: 'review', contentId: 'r1', text: 'x' });
      expect(result.action).toBe('auto_hide');
    });
  });

  describe('multi-provider verdict', () => {
    it('takes max confidence across providers', async () => {
      const svc = new ModerationService(
        new StubProvider(flaggedVerdict(0.6, 'profanity'), cleanVerdict),
        new StubProvider(cleanVerdict, flaggedVerdict(0.85, 'nsfw' as any))
      );
      const result = await svc.moderate({
        contentType: 'locket',
        contentId: 'l1',
        text: 'caption',
        imageUrl: 'http://example.com/x.jpg',
      });
      expect(result.category).toBe('nsfw');
      expect(result.confidence).toBe(0.85);
      expect(result.action).toBe('flag');
    });

    it('returns clean when all providers return clean', async () => {
      const svc = new ModerationService(
        new StubProvider(cleanVerdict, cleanVerdict),
        new StubProvider(cleanVerdict, cleanVerdict)
      );
      const result = await svc.moderate({ contentType: 'review', contentId: 'r1', text: 'x' });
      expect(result.action).toBe('pass');
      expect(result.flagged).toBe(false);
    });
  });

  describe('graceful degradation', () => {
    it('does not throw when text provider fails', async () => {
      const svc = new ModerationService(
        new FailingProvider(),
        new StubProvider(cleanVerdict, cleanVerdict)
      );
      const result = await svc.moderate({ contentType: 'review', contentId: 'r1', text: 'x' });
      expect(result.action).toBe('pass');
    });

    it('does not throw when image provider fails', async () => {
      const svc = new ModerationService(
        new StubProvider(cleanVerdict, cleanVerdict),
        new FailingProvider()
      );
      const result = await svc.moderate({
        contentType: 'locket',
        contentId: 'l1',
        imageUrl: 'http://x.jpg',
      });
      expect(result.action).toBe('pass');
    });
  });

  describe('empty content', () => {
    it('returns pass when no text or image', async () => {
      const svc = new ModerationService(
        new StubProvider(cleanVerdict, cleanVerdict),
        new StubProvider(cleanVerdict, cleanVerdict)
      );
      const result = await svc.moderate({ contentType: 'review', contentId: 'r1' });
      expect(result.action).toBe('pass');
      expect(result.flagged).toBe(false);
    });
  });

  describe('custom thresholds', () => {
    it('respects custom autoHideThreshold', async () => {
      const svc = new ModerationService(
        new StubProvider(flaggedVerdict(0.85), cleanVerdict),
        new StubProvider(cleanVerdict, cleanVerdict),
        0.8, // autoHideThreshold
        0.5, // flagThreshold
      );
      const result = await svc.moderate({ contentType: 'review', contentId: 'r1', text: 'x' });
      expect(result.action).toBe('auto_hide');
    });
  });
});
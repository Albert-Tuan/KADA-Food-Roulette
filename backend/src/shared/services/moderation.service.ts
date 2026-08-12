/**
 * Moderation Service - AI content moderation
 *
 * Abstraction layer over OpenAI Moderation API + NSFW.js
 * Reference: docs/decisions/001-ai-moderation.md
 *
 * Design: Adapter pattern để dễ swap implementation (mock vs real)
 */

export type ModerationCategory =
  | 'hate'
  | 'hate_threatening'
  | 'harassment'
  | 'harassment_threatening'
  | 'self_harm'
  | 'self_harm_intent'
  | 'self_harm_instructions'
  | 'sexual'
  | 'sexual_minors'
  | 'violence'
  | 'violence_graphic'
  | 'profanity'
  | 'spam'
  | 'nsfw';

export type ContentType = 'review' | 'locket' | 'comment' | 'chat_message';

export interface ModerationVerdict {
  flagged: boolean;
  category: ModerationCategory | null;
  confidence: number; // 0.0 - 1.0, highest category
  scores: Partial<Record<ModerationCategory, number>>;
  reason: string;
  rawResponse?: unknown;
}

export interface ModerationInput {
  contentType: ContentType;
  contentId: string;
  /** Text content (review body, caption, message) */
  text?: string;
  /** Image URL or base64 (cho locket photos) */
  imageUrl?: string;
  /** Optional metadata for context */
  metadata?: Record<string, unknown>;
}

export interface ModerationProvider {
  /** Provider name for logging */
  readonly name: string;

  /** Moderate text content */
  moderateText(text: string): Promise<ModerationVerdict>;

  /** Moderate image content */
  moderateImage(imageUrl: string): Promise<ModerationVerdict>;
}

/**
 * Moderation Service - Coordinates text + image moderation
 *
 * Workflow:
 *   1. Text moderation (if text provided)
 *   2. Image moderation (if image provided)
 *   3. Take MAX confidence across both
 *   4. Return combined verdict
 */
export class ModerationService {
  constructor(
    private readonly textProvider: ModerationProvider,
    private readonly imageProvider: ModerationProvider,
    private readonly autoHideThreshold = 0.9,
    private readonly flagThreshold = 0.7
  ) {}

  async moderate(input: ModerationInput): Promise<ModerationVerdict & { action: 'pass' | 'flag' | 'auto_hide' }> {
    const verdicts: ModerationVerdict[] = [];

    if (input.text && input.text.trim().length > 0) {
      try {
        const textVerdict = await this.textProvider.moderateText(input.text);
        verdicts.push(textVerdict);
      } catch (err) {
        console.error('[moderation] Text provider failed:', err);
        // Graceful degradation: skip text moderation nếu service down
      }
    }

    if (input.imageUrl) {
      try {
        const imageVerdict = await this.imageProvider.moderateImage(input.imageUrl);
        verdicts.push(imageVerdict);
      } catch (err) {
        console.error('[moderation] Image provider failed:', err);
        // Graceful degradation: skip image moderation nếu service down
      }
    }

    if (verdicts.length === 0) {
      return {
        flagged: false,
        category: null,
        confidence: 0,
        scores: {},
        reason: 'No content to moderate (both text and image missing)',
        action: 'pass',
      };
    }

    // Pick the highest-confidence flagged verdict
    const flagged = verdicts.filter((v) => v.flagged);
    if (flagged.length === 0) {
      return {
        flagged: false,
        category: null,
        confidence: 0,
        scores: {},
        reason: 'All providers returned clean',
        action: 'pass',
      };
    }

    const top = flagged.reduce((acc, v) =>
      v.confidence > acc.confidence ? v : acc
    );

    const action: 'pass' | 'flag' | 'auto_hide' =
      top.confidence >= this.autoHideThreshold
        ? 'auto_hide'
        : top.confidence >= this.flagThreshold
        ? 'flag'
        : 'pass';

    return { ...top, action };
  }
}
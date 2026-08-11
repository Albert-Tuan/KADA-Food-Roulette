/**
 * OpenAI Moderation API Adapter
 *
 * Reference: docs/decisions/001-ai-moderation.md §Text Moderation
 *
 * NOTE: Chưa tích hợp SDK thật. Dùng fetch trực tiếp tới OpenAI API.
 *       Install `openai` package nếu cần retry/backoff chuẩn.
 */

import {
  ModerationProvider,
  ModerationVerdict,
  ModerationCategory,
} from './moderation.service';

const OPENAI_MODERATION_URL = 'https://api.openai.com/v1/moderations';

interface OpenAIModerationResponse {
  id: string;
  model: string;
  results: Array<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }>;
}

/** Mapping từ OpenAI category names → internal enum */
const OPENAI_CATEGORY_MAP: Record<string, ModerationCategory> = {
  hate: 'hate',
  'hate/threatening': 'hate_threatening',
  harassment: 'harassment',
  'harassment/threatening': 'harassment_threatening',
  'self-harm': 'self_harm',
  'self-harm/intent': 'self_harm_intent',
  'self-harm/instructions': 'self_harm_instructions',
  sexual: 'sexual',
  'sexual/minors': 'sexual_minors',
  violence: 'violence',
  'violence/graphic': 'violence_graphic',
};

export class OpenAIModerationAdapter implements ModerationProvider {
  readonly name = 'openai-moderation';

  constructor(
    private readonly apiKey: string = process.env.OPENAI_API_KEY ?? '',
    private readonly model: string = 'om-moderator-latest'
  ) {
    if (!this.apiKey) {
      console.warn(
        '[openai-moderation] OPENAI_API_KEY not set. Service will throw on use.'
      );
    }
  }

  async moderateText(text: string): Promise<ModerationVerdict> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await fetch(OPENAI_MODERATION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: text,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(
        `OpenAI moderation API returned ${response.status}: ${errBody}`
      );
    }

    const data = (await response.json()) as OpenAIModerationResponse;
    const result = data.results[0];
    if (!result) {
      throw new Error('OpenAI moderation returned empty results');
    }

    return mapOpenAIResponse(result);
  }

  /** OpenAI không moderate images trực tiếp - delegate to NSFW provider */
  async moderateImage(_imageUrl: string): Promise<ModerationVerdict> {
    throw new Error(
      'OpenAI adapter does not support image moderation. Use NsfwAdapter.'
    );
  }
}

function mapOpenAIResponse(result: OpenAIModerationResponse['results'][0]): ModerationVerdict {
  const scores: Partial<Record<ModerationCategory, number>> = {};
  let topCategory: ModerationCategory | null = null;
  let topScore = 0;

  for (const [openAIName, isFlagged] of Object.entries(result.categories)) {
    if (!isFlagged) continue;
    const score = result.category_scores[openAIName] ?? 0;
    const internalName = OPENAI_CATEGORY_MAP[openAIName] ?? null;
    if (!internalName) continue;
    scores[internalName] = score;
    if (score > topScore) {
      topScore = score;
      topCategory = internalName;
    }
  }

  if (!topCategory) {
    return {
      flagged: false,
      category: null,
      confidence: 0,
      scores,
      reason: 'OpenAI: clean',
      rawResponse: result,
    };
  }

  return {
    flagged: true,
    category: topCategory,
    confidence: topScore,
    scores,
    reason: `OpenAI flagged as ${topCategory} (confidence ${(topScore * 100).toFixed(1)}%)`,
    rawResponse: result,
  };
}
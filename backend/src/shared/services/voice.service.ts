import fs from 'fs';
import path from 'path';

export interface MenuItemInput {
  name: string;
  priceVND?: number | null;
  category?: string;
  tags?: string[];
}

export interface VoicePickResult {
  transcription: string;
  cravedItems: Array<{ name: string; reason: string }>;
  matchedItems: Array<{ name: string; reason: string }>;
  excludedItems: Array<{ name: string; reason: string }>;
  aiSuggestions: Array<{ name: string; reason: string }>;
}

export const analyzeVoiceIntent = async (
  audioPath: string,
  mimeType: string,
  menuItems: MenuItemInput[]
): Promise<VoicePickResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }

  const resolvedPath = path.isAbsolute(audioPath) ? audioPath : path.resolve(process.cwd(), audioPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Audio file not found at path: ${resolvedPath}`);
  }

  const audioBuffer = fs.readFileSync(resolvedPath);
  const base64Audio = audioBuffer.toString('base64');

  const promptText = `
You are an expert AI Speech-to-Intent Analyzer for Vietnamese group dining.
You will analyze an audio recording of a group of friends sitting together at a restaurant table discussing what food they want to order.

BACKGROUND NOISE & EXTRACTION INSTRUCTIONS:
- Listen carefully to ALL voices in the audio, even those in the background. DO NOT ignore any voice.
- EXHAUSTIVE EXTRACTION: You MUST extract and list EVERY SINGLE food item mentioned by anyone. DO NOT omit any food items. Do not summarize or group them.
- If the menuItems list is empty, just extract the exact names the users said.

VIETNAMESE INTENT & DESIRE LEXICON:
Classify food preferences into these 5 distinct levels:
1. CRAVED (Khao khát / Thèm thuồng - High Priority):
   Keywords: "thèm", "khao khát", "nhất định phải ăn", "mê", "nghiện", "thèm thuồng", "phải thử", "rất muốn", "cực thích", "ghiền", "chốt món này", "order món này liền".
2. DESIRED (Mong muốn / Thích):
   Keywords: "thích", "muốn", "ăn thử", "cũng được", "dễ ăn", "nghe hay", "ổn đấy", "hợp lý", "gợi ý".
3. NEUTRAL (Trung tính / Phân vân):
   Keywords: "tùy", "sao cũng được", "xem đã", "chưa biết".
4. AVOIDED (Né / Không hào hứng):
   Keywords: "thôi", "chán", "ngán", "không khoái", "để sau", "hôm nay không muốn".
5. REJECTED (Ghét / Dị ứng / Cấm - Strict Exclusion):
   Keywords: "ghét", "dị ứng", "tuyệt đối không", "sợ", "không bao giờ", "đừng", "kiêng", "nhịn", "đừng gọi".

RESTAURANT MENU ITEMS TO MATCH AGAINST (If empty, just use transcript names):
${JSON.stringify(menuItems, null, 2)}

OUTPUT FORMAT REQUIREMENTS:
Return ONLY a valid raw JSON object matching the structure below. DO NOT wrap in markdown code blocks (\`\`\`json).
{
  "transcription": "Ghi lại chi tiết TẤT CẢ văn bản tiếng Việt bạn nghe được (Transcript chi tiết, KHÔNG tóm tắt)",
  "cravedItems": [
    { "name": "Exact Name from Menu or Audio", "reason": "Lý do bạn nào đó cực kỳ thèm/khao khát" }
  ],
  "matchedItems": [
    { "name": "Exact Name from Menu or Audio", "reason": "Lý do món này được chọn" }
  ],
  "excludedItems": [
    { "name": "Exact Name from Menu or Audio", "reason": "Lý do bị loại (vd: dị ứng, không ăn được)" }
  ],
  "aiSuggestions": [
    { "name": "Exact Name from Menu or Audio", "reason": "Gợi ý từ AI dựa trên gu chung của nhóm" }
  ]
}
`;

  const contents = [
    {
      parts: [
        { text: promptText },
        {
          inline_data: {
            mime_type: mimeType || 'audio/m4a',
            data: base64Audio,
          },
        },
      ],
    },
  ];

  console.log(`[VoiceService] Sending ${audioBuffer.length} bytes of audio to Gemini AI...`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

  const apiResponse = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey.replace(/['"]/g, '').trim(),
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!apiResponse.ok) {
    const errorText = await apiResponse.text();
    console.error('[VoiceService] Gemini API Error:', apiResponse.status, errorText);
    throw new Error(`Gemini API Error: ${apiResponse.status} - ${errorText}`);
  }

  interface GeminiResponse {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  }

  const data = (await apiResponse.json()) as GeminiResponse;
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  try {
    const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed: VoicePickResult = JSON.parse(cleanText);
    return {
      transcription: parsed.transcription || 'Đã ghi nhận giọng nói của nhóm.',
      cravedItems: parsed.cravedItems || [],
      matchedItems: parsed.matchedItems || [],
      excludedItems: parsed.excludedItems || [],
      aiSuggestions: parsed.aiSuggestions || [],
    };
  } catch (e: unknown) {
    console.error('[VoiceService] Failed to parse JSON from Gemini:', rawText);
    throw new Error('AI returned invalid format for voice analysis.', { cause: e });
  }
};

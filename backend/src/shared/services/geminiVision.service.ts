import fs from 'node:fs';

export interface GeminiParsedMenuItem {
  name: string;
  priceVND: number | null;
  category: string;
  subDishes?: string[];
  ingredients?: string[];
  spicinessLevel?: number; // 0: không cay, 1-5: mức độ cay
  isVegetarian?: boolean;
  tags?: string[];
}

export interface GeminiVisionParseResult {
  items: GeminiParsedMenuItem[];
  confidence: number;
  rawText: string;
}

export class GeminiVisionService {
  private static repairAndParseJson(jsonString: string): any {
    let str = jsonString.trim();
    const firstBrace = str.indexOf('{');
    if (firstBrace !== -1) {
      str = str.substring(firstBrace);
    }

    try {
      return JSON.parse(str);
    } catch {
      // Fix unclosed quotes, commas, and trailing brackets
      let openBrackets = 0;
      let openBraces = 0;
      let inString = false;
      let isEscaped = false;

      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (isEscaped) {
          isEscaped = false;
          continue;
        }
        if (char === '\\') {
          isEscaped = true;
          continue;
        }
        if (char === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (char === '{') openBraces++;
          else if (char === '}') openBraces--;
          else if (char === '[') openBrackets++;
          else if (char === ']') openBrackets--;
        }
      }

      if (inString) str += '"';
      str = str.replace(/,\s*$/, '');

      while (openBrackets > 0) {
        str += ']';
        openBrackets--;
      }
      while (openBraces > 0) {
        str += '}';
        openBraces--;
      }

      try {
        return JSON.parse(str);
      } catch {
        // Fallback: Regex extract individual valid JSON objects inside items array
        const itemMatches = str.match(/\{[^{}]*"name"\s*:\s*"[^"]+"[^{}]*\}/g);
        if (itemMatches && itemMatches.length > 0) {
          const validItems = itemMatches.map(m => {
            try { return JSON.parse(m); } catch { return null; }
          }).filter(Boolean);
          return { items: validItems };
        }
        throw new Error('Could not repair JSON response');
      }
    }
  }

  static async parseMenuImage(imagePath: string): Promise<GeminiVisionParseResult | null> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.log('[GeminiVision] No GEMINI_API_KEY provided in environment. Skipping Vision AI.');
      return null;
    }

    try {
      if (!fs.existsSync(imagePath)) {
        console.error(`[GeminiVision] Image file not found: ${imagePath}`);
        return null;
      }

      const imageBuffer = fs.readFileSync(imagePath);
      const base64Data = imageBuffer.toString('base64');

      const lower = imagePath.toLowerCase();
      let mimeType = 'image/jpeg';
      if (lower.endsWith('.png')) mimeType = 'image/png';
      else if (lower.endsWith('.webp')) mimeType = 'image/webp';

      const prompt = `Bạn là chuyên gia OCR và trích xuất menu ẩm thực Việt Nam cao cấp.
Hãy đọc kỹ hình ảnh menu này và trích xuất CHÍNH XÁC 100% tất cả các món ăn, tên combo, giá tiền từ hình ảnh menu được tải lên.

Trả về kết quả cấu trúc JSON duy nhất theo định dạng:
{
  "items": [
    {
      "name": "Tên món ăn trích xuất từ hình ảnh",
      "priceVND": 50000,
      "category": "combo" | "món chính" | "đồ uống" | "tráng miệng" | "món phụ",
      "subDishes": ["Các món con trích xuất từ combo trong ảnh (nếu có)"],
      "ingredients": ["thịt bò", "gà", "hải sản"],
      "spicinessLevel": 0,
      "isVegetarian": false,
      "tags": ["cay", "nướng"]
    }
  ]
}

Quy tắc quan trọng:
1. Trích xuất CHÍNH XÁC những món ăn có chữ xuất hiện trong hình ảnh được tải lên. Tuyệt đối KHÔNG tự bịa món ăn không có trong ảnh.
2. Đổi giá tiền K (ví dụ 45K -> 45000, 120K -> 120000, 95k -> 95000).
3. Không thêm bất kỳ lời giải thích nào ngoài chuỗi JSON duy nhất.`;

      const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
      let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            response_mime_type: 'application/json',
            maxOutputTokens: 8192,
            temperature: 0.1
          }
        })
      });

      if (!response.ok && modelName !== 'gemini-3.5-flash') {
        console.warn(`[GeminiVision] Primary model ${modelName} returned ${response.status}. Retrying with gemini-3.5-flash...`);
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }],
            generationConfig: {
              response_mime_type: 'application/json',
              maxOutputTokens: 8192,
              temperature: 0.1
            }
          })
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GeminiVision] API Error ${response.status}:`, errorText);
        return null;
      }

      const data = await response.json() as any;
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textContent) {
        console.error('[GeminiVision] Empty response from Gemini API');
        return null;
      }

      const parsedJson = GeminiVisionService.repairAndParseJson(textContent);

      const items: GeminiParsedMenuItem[] = (parsedJson.items || []).map((item: any) => ({
        name: String(item.name || '').trim(),
        priceVND: typeof item.priceVND === 'number' ? item.priceVND : null,
        category: String(item.category || 'món chính').toLowerCase(),
        subDishes: Array.isArray(item.subDishes) ? item.subDishes.map(String) : [],
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.map(String) : [],
        spicinessLevel: typeof item.spicinessLevel === 'number' ? item.spicinessLevel : 0,
        isVegetarian: Boolean(item.isVegetarian),
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      })).filter((i: GeminiParsedMenuItem) => i.name.length > 0);

      console.log(`[GeminiVision] Successfully parsed ${items.length} menu items from image.`);
      return {
        items,
        confidence: items.length > 0 ? 0.98 : 0,
        rawText: textContent
      };
    } catch (err: any) {
      console.error('[GeminiVision Exception]:', err?.message || err);
      return null;
    }
  }
}

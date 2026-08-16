import fs from 'node:fs';
import sharp from 'sharp';

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
  private static repairAndParseJson(jsonString: string): Record<string, unknown> {
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

  static async parseMenuImages(imagePaths: string[]): Promise<GeminiVisionParseResult | null> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.log('[GeminiVision] No GEMINI_API_KEY provided in environment. Skipping Vision AI.');
      return null;
    }

    if (!imagePaths || imagePaths.length === 0) {
      console.warn('[GeminiVision] No image paths provided.');
      return null;
    }

    // Chunk images to avoid exceeding Max Output Tokens (8192) for large menus
    const CHUNK_SIZE = 4;
    const allItems: GeminiParsedMenuItem[] = [];
    let combinedRawText = '';
    
    for (let i = 0; i < imagePaths.length; i += CHUNK_SIZE) {
      const chunkPaths = imagePaths.slice(i, i + CHUNK_SIZE);
      console.log(`[GeminiVision] Processing chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(imagePaths.length / CHUNK_SIZE)} (${chunkPaths.length} images)...`);
      
      const parts: Record<string, unknown>[] = [];
      const prompt = `Bạn là chuyên gia OCR và trích xuất menu ẩm thực Việt Nam cao cấp.
Hãy đọc kỹ TẤT CẢ các hình ảnh menu được tải lên và trích xuất CHÍNH XÁC 100% tất cả các món ăn, tên combo, giá tiền từ toàn bộ các trang menu.

Trích xuất ĐẦY ĐỦ VÀ CHÍNH XÁC các ký tự tiếng Việt (đúng dấu). 
Đặc biệt chú ý cột giá tiền: đôi khi giá được đặt ở lề phải, dưới dạng các con số (VD: 45, 60, 120, 45K, 45.000). BẮT BUỘC phải đối chiếu đúng món ăn với giá tiền tương ứng trên cùng một hàng hoặc ngay bên dưới. Không được bỏ sót giá của bất kỳ món nào nếu trong ảnh có ghi.

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
1. Trích xuất CHÍNH XÁC những món ăn có chữ xuất hiện trong hình ảnh được tải lên. Tuyệt đối KHÔNG tự bịa món ăn.
2. TỰ ĐỘNG SỬA LỖI CHÍNH TẢ tiếng Việt dựa theo ngữ cảnh món ăn nếu ảnh bị mờ hoặc lóa sáng (ví dụ: thấy "Bún bò huể" thì tự sửa thành "Bún bò huế", "ET Ï ít l2" tự sửa hoặc loại bỏ nếu là rác).
3. Quy đổi giá tiền sang đơn vị VNĐ đầy đủ (ví dụ: 45 -> 45000, 45K -> 45000, 120.000 -> 120000, 95k -> 95000). Nếu không tìm thấy giá, đặt giá trị là null.
4. Gộp toàn bộ kết quả từ TẤT CẢ các ảnh vào một mảng "items" duy nhất. Không thêm bất kỳ lời giải thích nào ngoài chuỗi JSON duy nhất.`;

      parts.push({ text: prompt });

      for (const imagePath of chunkPaths) {
        if (!fs.existsSync(imagePath)) {
          console.error(`[GeminiVision] Image file not found, skipping: ${imagePath}`);
          continue;
        }

        const lower = imagePath.toLowerCase();
        let mimeType = 'image/jpeg';
        if (lower.endsWith('.png')) mimeType = 'image/png';
        else if (lower.endsWith('.webp')) mimeType = 'image/webp';

        // Downsize images to 1024x1024 for batches to significantly reduce payload size and memory
        let processedBuffer: Buffer;
        try {
          processedBuffer = await sharp(imagePath)
            .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 75 })
            .toBuffer();
          mimeType = 'image/jpeg';
        } catch (sharpErr) {
          console.warn(`[GeminiVision] Sharp preprocessing failed for ${imagePath}, using original file:`, sharpErr);
          processedBuffer = fs.readFileSync(imagePath);
        }

        parts.push({
          inline_data: {
            mime_type: mimeType,
            data: processedBuffer.toString('base64')
          }
        });
      }

      if (parts.length === 1) { // Only prompt text was added
         console.warn('[GeminiVision] No valid images were processed in this chunk.');
         continue;
      }

      // Map user friendly names to real API model names if needed
      let userModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
      if (userModel === 'Gemini 3.1 Pro' || userModel === 'gemini-3.1-pro') {
          userModel = 'gemini-3.1-pro-preview';
      }

      const modelsToTry = [userModel, 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.7-flash'];
      let response: Response | null = null;

      for (const modelName of modelsToTry) {
        console.log(`[GeminiVision] Attempting to use model: ${modelName}`);
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: parts
              }],
              generationConfig: {
                response_mime_type: 'application/json',
                maxOutputTokens: 8192,
                temperature: 0.1
              }
            })
          });

          if (res.ok) {
            response = res;
            console.log(`[GeminiVision] Successfully got response from ${modelName}`);
            break; // Stop trying if successful
          } else {
             const errorText = await res.text();
             console.warn(`[GeminiVision] Model ${modelName} failed with status ${res.status}: ${errorText.substring(0, 200)}`);
          }
        } catch (e) {
          console.warn(`[GeminiVision] Fetch error with model ${modelName}:`, e);
        }
      }

      if (!response || !response.ok) {
        console.error(`[GeminiVision] All models exhausted or API Error for chunk.`);
        continue;
      }

      const data = await response.json() as Record<string, unknown>;
      const candidates = data.candidates as Array<Record<string, unknown>> | undefined;
      const content = candidates?.[0]?.content as Record<string, unknown> | undefined;
      const responseParts = content?.parts as Array<Record<string, unknown>> | undefined;
      const textContent = responseParts?.[0]?.text as string | undefined;

      if (!textContent) {
        console.error('[GeminiVision] Empty response from Gemini API for chunk');
        continue;
      }
      
      combinedRawText += textContent + '\n';

      try {
        const parsedJson = GeminiVisionService.repairAndParseJson(textContent);
        const rawItems = Array.isArray(parsedJson.items) ? parsedJson.items : [];
        const chunkItems: GeminiParsedMenuItem[] = rawItems.map((item: Record<string, unknown>) => ({
          name: String(item.name || '').trim(),
          priceVND: typeof item.priceVND === 'number' ? item.priceVND : null,
          category: String(item.category || 'món chính').toLowerCase(),
          subDishes: Array.isArray(item.subDishes) ? item.subDishes.map(String) : [],
          ingredients: Array.isArray(item.ingredients) ? item.ingredients.map(String) : [],
          spicinessLevel: typeof item.spicinessLevel === 'number' ? item.spicinessLevel : 0,
          isVegetarian: Boolean(item.isVegetarian),
          tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        })).filter((i: GeminiParsedMenuItem) => i.name.length > 0);
        
        allItems.push(...chunkItems);
      } catch (parseErr) {
        console.error('[GeminiVision] Failed to parse JSON for chunk:', parseErr);
      }
    } // End of chunk loop

    if (allItems.length === 0) {
      console.error(`[GeminiVision] All chunks failed or returned 0 items.`);
      return null;
    }

    console.log(`[GeminiVision] Successfully parsed ${allItems.length} total menu items from all chunks.`);
    return {
      items: allItems,
      confidence: 0.98,
      rawText: combinedRawText
    };
  }
}

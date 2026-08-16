import fs from 'fs';
import path from 'path';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

interface TextPart { text: string }
interface InlineDataPart { inlineData: { data: string; mimeType: string } }
type GeminiPart = TextPart | InlineDataPart;

export class OcrService {
  static async extractText(imagePath: string): Promise<string> {
    try {
      const resolvedPath = path.isAbsolute(imagePath) ? imagePath : path.resolve(process.cwd(), imagePath);
      if (!fs.existsSync(resolvedPath)) {
        return '';
      }
      const preprocessedBuffer = await sharp(resolvedPath)
        .rotate()
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer();

      const { data: { text } } = await Tesseract.recognize(preprocessedBuffer, 'vie+eng');
      return text || '';
    } catch {
      return '';
    }
  }
}

export const extractMenuItems = async (imagePaths: string[]): Promise<Record<string, unknown>[]> => {
  try {
    if (!imagePaths || imagePaths.length === 0) {
      console.warn('[OCR] No images provided to extractMenuItems');
      return [];
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const parts: GeminiPart[] = [];
    parts.push({
      text: `You are an expert OCR parser for restaurant menus. Extract all food and drink items from the provided menu images. 
Return ONLY a valid JSON array of objects with the following schema:
[
  {
    "name": "string",
    "priceVND": number,
    "category": "string",
    "tags": ["string"]
  }
]
Return raw JSON array only.`
    });

    for (const imagePath of imagePaths) {
      const resolvedPath = path.isAbsolute(imagePath) ? imagePath : path.resolve(process.cwd(), imagePath);
      if (fs.existsSync(resolvedPath)) {
        const imageBuffer = fs.readFileSync(resolvedPath);
        const mimeType = resolvedPath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        parts.push({
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType
          }
        });
      }
    }

    console.log(`[OCR] Starting Gemini OCR for ${imagePaths.length} images using REST API...`);
    
    // Convert parts format to the REST API format
    const contents = [{
      parts: parts.map(p => {
        if ('text' in p) return { text: p.text };
        if ('inlineData' in p) return {
          inline_data: {
            mime_type: p.inlineData.mimeType,
            data: p.inlineData.data
          }
        };
        return p;
      })
    }];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
    
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey.replace(/['"]/g, '').trim()
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[OCR] Gemini API HTTP Error:', apiResponse.status, errorText);
      throw new Error(errorText);
    }

    interface GeminiResponse {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    }
    const data = (await apiResponse.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    let items = [];
    try {
      // Strip out markdown code blocks if Gemini ignores the instruction
      const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      items = JSON.parse(cleanText);
      
      // Ensure items is an array
      if (!Array.isArray(items)) {
        if (items.items && Array.isArray(items.items)) {
          items = items.items;
        } else {
          items = [items];
        }
      }
      
      // Fix any string prices
      items = items.map((item: Record<string, unknown>) => {
        if (typeof item.priceVND === 'string') {
          const num = parseInt(item.priceVND.replace(/\D/g, ''), 10);
          item.priceVND = isNaN(num) ? null : (num < 1000 ? num * 1000 : num);
        }
        return item;
      });

      console.log(`[OCR] Gemini OCR successfully extracted ${items.length} items.`);
      return items;
    } catch (e: unknown) {
      console.error('[OCR] Failed to parse Gemini response as JSON:', text);
      throw new Error('AI returned invalid data format.', { cause: e });
    }
  } catch (error: unknown) {
    console.error(`[OCR Error] Gemini OCR failed:`, error instanceof Error ? error.message : error);
    throw error;
  }
};

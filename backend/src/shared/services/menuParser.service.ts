export interface ParsedMenuItem {
  name: string;
  priceVND: number | null;
  category: string;
  tags: string[];
}

export interface ParsedMenuResult {
  items: ParsedMenuItem[];
  confidence: number;
  rawText: string;
}

// Vietnamese food vocabulary for validation
const VIET_FOOD_WORDS = new Set([
  // Món chính
  'com', 'bun', 'pho', 'mi', 'hu', 'tieu', 'banh', 'canh', 'chao', 'xoi',
  'lau', 'nuong', 'chien', 'hap', 'kho', 'rim', 'xao', 'luoc', 'ham',
  // Protein
  'ga', 'heo', 'bo', 'tom', 'ca', 'muc', 'cua', 'oc', 'vit', 'trung',
  'thit', 'suon', 'dui', 'canh', 'long', 'gan',
  // Đồ uống
  'tra', 'cafe', 'phe', 'sua', 'sinh', 'nuoc', 'bia', 'ruou', 'soda',
  'chanh', 'cam', 'dua', 'dao', 'xoai', 'oi', 'tao',
  'freeze', 'frappe', 'latte', 'espresso', 'cappuccino', 'mocha',
  'phin', 'bac', 'xiu', 'den', 'nong', 'da', 'matcha', 'chocolate',
  // Tráng miệng
  'che', 'kem', 'flan', 'mousse', 'tiramisu', 'cookie',
  // Nguyên liệu
  'pho', 'mai', 'bo', 'trung', 'rau', 'cu', 'nam', 'ot', 'hanh',
  'toi', 'gung', 'sa', 'me', 'dau', 'hu', 'phu',
  // Phương pháp chế biến
  'rang', 'muoi', 'chien', 'gion', 'sot', 'tuong',
  // Các từ phổ biến trong menu
  'dac', 'biet', 'thuong', 'nho', 'lon', 'vua',
  'caramel', 'vanilla', 'cream', 'yogurt', 'smoothie',
]);

export class MenuParserService {
  private static removeDiacritics(str: string): string {
    return str.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  /**
   * Scores how likely a string is a real Vietnamese food/drink name.
   * Returns 0-1 where 1 = definitely a food name.
   */
  static foodNameScore(name: string): number {
    const normalized = MenuParserService.removeDiacritics(name.toLowerCase());
    const words = normalized.split(/\s+/).filter(w => w.length >= 2);

    if (words.length === 0) return 0;

    let matchCount = 0;
    for (const word of words) {
      if (VIET_FOOD_WORDS.has(word)) {
        matchCount++;
      }
    }

    return matchCount / Math.max(words.length, 1);
  }

  /**
   * Sanitize OCR artifacts from a raw name string.
   */
  static cleanName(rawName: string): string {
    let cleaned = rawName
      // Remove common OCR garbage symbols
      .replace(/[œŒ©®™—–|~`_^=@#$*%{}[\]\\<>]/g, ' ')
      // Remove standalone single characters that are likely OCR noise
      .replace(/\b[^aàáạảãăằắặẳẵâầấậẩẫeèéẹẻẽêềếệểễiìíịỉĩoòóọỏõôồốộổỗơờớợởỡuùúụủũưừứựửữyỳýỵỷỹđĐA-Z0-9]\b/g, ' ')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim();

    // Remove leading non-alphanumeric/non-Vietnamese chars
    cleaned = cleaned.replace(/^[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]+/, '');
    // Remove trailing garbage
    cleaned = cleaned.replace(/[^a-zA-Z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ)\]]+$/, '');

    return cleaned.trim();
  }

  /**
   * Determine if a line of OCR text is garbage noise rather than a real menu item.
   */
  static isGarbageNoise(line: string): boolean {
    const trimmed = line.trim();

    // Too short or too long
    if (trimmed.length < 3 || trimmed.length > 120) return true;

    const normalized = MenuParserService.removeDiacritics(trimmed.toLowerCase());

    // Known non-food text patterns
    const noisePatterns = [
      'don vi tinh', 'unit', 'tuong duong', 'mien phi giao hang',
      'trong ban kinh', 'goi ngay', 'hung khoi', 'chuyen tro',
      'thuc don', 'bang gia', 'dat hang', 'lien he', 'hotline',
      'wifi', 'password', 'welcome', 'khuyen mai', 'giam gia',
      'dieu khoan', 'quy dinh', 'luu y', 'ghi chu', 'note',
      'follow', 'like', 'share', 'instagram', 'facebook', 'website',
      'dia chi', 'address', 'so dien thoai', 'phone', 'tel',
      'gio mo cua', 'opening', 'hours',
    ];

    if (noisePatterns.some(kw => normalized.includes(kw))) {
      return true;
    }

    // Count how many characters are actual letters vs noise
    const vietnameseLetters = (trimmed.match(/[a-zA-ZàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/g) || []).length;
    const totalNonSpace = trimmed.replace(/\s/g, '').length;

    // If less than 50% of non-space chars are letters, it's garbage
    if (totalNonSpace > 0 && vietnameseLetters / totalNonSpace < 0.5) {
      return true;
    }

    // If mostly uppercase consonants with no recognizable Vietnamese words, likely OCR garbage
    const words = normalized.split(/\s+/).filter(w => w.length >= 2);
    if (words.length > 0) {
      const foodScore = MenuParserService.foodNameScore(trimmed);
      // If no Vietnamese food words recognized AND name looks random
      if (foodScore === 0 && words.length <= 3) {
        // Check if it at least looks like a plausible name (has vowels, proper structure)
        const vowelCount = (normalized.match(/[aeiou]/g) || []).length;
        if (vowelCount < normalized.replace(/\s/g, '').length * 0.2) {
          return true;
        }
      }
    }

    return false;
  }

  static normalizePrice(raw: string): number | null {
    let processed = raw.toLowerCase().replace(/\s/g, '');

    if (processed.includes('k')) {
      const num = parseFloat(processed.replace(/k.*$/, '').replace(',', '.'));
      if (!isNaN(num) && num >= 1 && num <= 5000) return num * 1000;
    }

    processed = processed.replace(/[đd]/g, '');
    processed = processed.replace(/\./g, '').replace(/,/g, '');

    const num = parseInt(processed, 10);
    if (!isNaN(num) && num >= 1000 && num <= 5000000) {
      return num;
    }

    return null;
  }

  static isHeader(line: string): boolean {
    const normalized = MenuParserService.removeDiacritics(line.toLowerCase()).trim();
    const headerKeywords = ['mon chinh', 'do uong', 'khai vi', 'trang mieng', 'dac biet', 'menu', 'thuc don', 'combo'];

    if (normalized.length < 3 || normalized.length > 30) return false;
    // Lines that are ALL CAPS with only ASCII letters are likely section headers
    if (line === line.toUpperCase() && /^[A-Z\s]+$/.test(line.trim())) return true;

    return headerKeywords.some(kw => normalized === kw || normalized.startsWith(kw + ' '));
  }

  static isPageNumber(line: string): boolean {
    const trimmed = line.trim();
    if (/^\d{1,3}$/.test(trimmed)) return true;
    if (/^page\s*\d+$/i.test(trimmed)) return true;
    if (/^trang\s*\d+$/i.test(trimmed)) return true;
    return false;
  }

  static inferCategory(name: string): string {
    const normalized = MenuParserService.removeDiacritics(name.toLowerCase());

    const categories: Record<string, string[]> = {
      'đồ uống': [
        'nuoc', 'tra', 'ca phe', 'cafe', 'sinh to', 'bia', 'ruou', 'soda', 'coca',
        'freeze', 'frappe', 'phin', 'bac xiu', 'latte', 'tea', 'espresso',
        'cappuccino', 'mocha', 'matcha', 'chocolate', 'smoothie', 'yogurt',
        'chanh', 'cam', 'dao', 'xoai', 'dua',
      ],
      'tráng miệng': [
        'che', 'kem', 'flan', 'trai cay', 'tiramisu', 'mousse', 'cookie',
        'pudding', 'cake',
      ],
      'món chính': [
        'com', 'bun', 'pho', 'mi', 'hu tieu', 'banh mi', 'banh canh',
        'lau', 'nuong', 'chien', 'xao', 'kho', 'ham', 'hap',
        'ga', 'heo', 'bo', 'tom', 'ca', 'muc', 'cua', 'vit',
        'thit', 'suon', 'xoi', 'chao',
      ]
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => normalized.includes(kw))) {
        return category;
      }
    }

    return 'món chính';
  }

  static inferTags(name: string): string[] {
    const normalized = MenuParserService.removeDiacritics(name.toLowerCase());
    const tags = new Set<string>();

    const tagKeywords: Record<string, string[]> = {
      'cay': ['cay', 'ot', 'sate', 'wasabi', 'kim chi'],
      'chay': ['chay', 'vegetarian', 'rau cu', 'dau hu', 'dau phu'],
      'chiên': ['chien', 'ran', 'gion'],
      'nướng': ['nuong', 'than', 'bbq', 'grill'],
      'hấp': ['hap', 'steam'],
      'soup': ['sup', 'canh', 'lau']
    };

    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some(kw => normalized.includes(kw))) {
        tags.add(tag);
      }
    }

    return Array.from(tags);
  }

  static calculateConfidence(items: ParsedMenuItem[], totalLines: number): number {
    if (items.length === 0) return 0;
    const itemsWithPrice = items.filter(item => item.priceVND !== null).length;
    const priceRatio = itemsWithPrice / items.length;
    const extractionRatio = Math.min(1, items.length / Math.max(totalLines, 1));
    return Math.min(0.95, Math.max(0.3, (priceRatio * 0.7 + extractionRatio * 0.3)));
  }

  /**
   * Extract price values embedded within text (e.g. "Phin Đen Đá 29 35 39")
   * Returns the first valid price found, treating bare 2-digit numbers as thousands VND.
   */
  static extractEmbeddedPrices(text: string): { name: string; prices: number[] } {
    // Match sequences of numbers that look like prices
    const pricePattern = /\b(\d{2,3})\b/g;
    const prices: number[] = [];
    let cleanedName = text;
    let match;

    while ((match = pricePattern.exec(text)) !== null) {
      const num = parseInt(match[1], 10);
      // In Vietnamese menus, bare 2-digit numbers like 29, 35, 39, 45, 55, 65 are prices in thousands
      if (num >= 10 && num <= 500) {
        prices.push(num * 1000);
      }
    }

    if (prices.length > 0) {
      // Remove the price numbers from the name
      cleanedName = text.replace(/\b\d{2,3}\b/g, ' ').replace(/\s+/g, ' ').trim();
    }

    return { name: cleanedName, prices };
  }

  static parse(rawText: string): ParsedMenuResult {
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const items: ParsedMenuItem[] = [];
    const seenNames = new Set<string>();

    for (const line of lines) {
      if (MenuParserService.isPageNumber(line) || MenuParserService.isHeader(line)) {
        continue;
      }

      // Pre-clean the line
      let workLine = line
        .replace(/[œŒ©®™—–|~`_^=@#$*%{}[\]\\<>()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (workLine.length < 3) continue;

      // Try standard price extraction first (price at end)
      const priceRegex = /\s+(\d+[kK]|\d{1,3}(?:[.,]\d{3})*(?:\s*đ|\s*d)?)$/;
      const priceMatch = workLine.match(priceRegex);

      let rawName = workLine;
      let price: number | null = null;

      if (priceMatch) {
        rawName = workLine.substring(0, priceMatch.index).trim();
        price = MenuParserService.normalizePrice(priceMatch[1]);
      } else {
        // Try extracting embedded prices (common in Vietnamese menus: "Phin Đen Đá 29 35 39")
        const extracted = MenuParserService.extractEmbeddedPrices(workLine);
        if (extracted.prices.length > 0) {
          rawName = extracted.name;
          price = extracted.prices[0]; // Use the smallest/first price
        }
      }

      const cleanedName = MenuParserService.cleanName(rawName);

      // Final validation
      if (cleanedName.length < 3) continue;
      if (MenuParserService.isGarbageNoise(cleanedName)) continue;

      const lowerKey = cleanedName.toLowerCase().replace(/\s+/g, '');
      if (seenNames.has(lowerKey)) continue;

      seenNames.add(lowerKey);
      items.push({
        name: cleanedName,
        priceVND: price,
        category: MenuParserService.inferCategory(cleanedName),
        tags: MenuParserService.inferTags(cleanedName)
      });
    }

    return {
      items,
      confidence: MenuParserService.calculateConfidence(items, lines.length),
      rawText
    };
  }
}

export interface PreferenceInput {
  spiceTolerance?: string; // 'none' | 'mild' | 'medium' | 'spicy'
  dietaryRestrictions?: string[];
  dislikedIngredients?: string[];
  priceRange?: number; // 1: <50k, 2: 50k-150k, 3: 150k-300k, 4: >300k
}

export interface PersonalizedMenuItem {
  name: string;
  priceVND: number | null;
  category: string;
  tags: string[];
  subDishes?: string[];
  matchScore: number; // 0 - 100
  isRecommended: boolean;
  warnings: string[];
  recommendationReason?: string;
}

export class PersonalizationService {
  /**
   * Helper function to calculate a realistic dynamic base score per dish
   * based on dish type, combo sub-dishes count, and item characteristics.
   */
  private static calculateBaseScore(item: {
    name: string;
    priceVND?: number | null;
    category?: string;
    subDishes?: string[];
    tags?: string[];
  }): number {
    const nameLower = item.name.toLowerCase();
    const catLower = (item.category || '').toLowerCase();
    const subCount = item.subDishes?.length || 0;

    let base = 82;

    // 1. Signature / Combo bonus (Nhiều món combo hoặc từ khóa đặc sắc)
    if (subCount >= 3 || nameLower.includes('combo') || nameLower.includes('đặc biệt') || nameLower.includes('bộ đôi')) {
      base += 10; // Combo/Đặc biệt 92%
    } else if (nameLower.includes('nướng') || nameLower.includes('lẩu') || nameLower.includes('bò') || nameLower.includes('dê')) {
      base += 6; // Món chính đặc sắc 88%
    } else if (catLower.includes('nước') || catLower.includes('giải khát') || nameLower.includes('coca') || nameLower.includes('trà')) {
      base -= 6; // Nước uống 76%
    } else if (subCount === 1 || nameLower.includes('cơm') || nameLower.includes('mì')) {
      base += 3; // Món đơn phổ biến 85%
    }

    // 2. Deterministic hash variance per item name (tránh món nào cũng bằng % nhau)
    let hash = 0;
    for (let i = 0; i < item.name.length; i++) {
      hash = (hash << 5) - hash + item.name.charCodeAt(i);
      hash |= 0;
    }
    const variance = (Math.abs(hash) % 7) - 3; // -3 to +3%

    return Math.max(70, Math.min(98, base + variance));
  }

  static personalizeMenuItems(
    items: Array<{
      name: string;
      priceVND?: number | null;
      category?: string;
      subDishes?: string[];
      tags?: string[];
      ingredients?: string[];
      spicinessLevel?: number;
      isVegetarian?: boolean;
    }>,
    preferences?: PreferenceInput | null
  ): PersonalizedMenuItem[] {
    const {
      spiceTolerance = 'medium',
      dietaryRestrictions = [],
      dislikedIngredients = [],
      priceRange = 2,
    } = preferences || {};

    const lowerDisliked = (Array.isArray(dislikedIngredients) ? dislikedIngredients : [])
      .map(i => String(i).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

    const lowerDietary = (Array.isArray(dietaryRestrictions) ? dietaryRestrictions : [])
      .map(d => String(d).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

    const maxSpiceMap: Record<string, number> = {
      'none': 0,
      'mild': 1,
      'medium': 2,
      'spicy': 5,
    };
    const maxSpiceAllowed = maxSpiceMap[spiceTolerance] ?? 2;

    return items.map(item => {
      let score = this.calculateBaseScore(item);
      const warnings: string[] = [];
      const itemTags = new Set<string>(item.tags || []);

      const subDishesText = (item.subDishes || []).join(' ');
      const ingredientsText = (item.ingredients || []).join(' ');
      const fullText = `${item.name} ${subDishesText} ${ingredientsText}`;
      const normalizedFullText = fullText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // 1. Budget Suitability Matching (+5% if matching budget)
      if (item.priceVND) {
        const price = item.priceVND;
        let itemBudgetLevel = 1;
        if (price > 300000) itemBudgetLevel = 4;
        else if (price > 150000) itemBudgetLevel = 3;
        else if (price > 50000) itemBudgetLevel = 2;

        if (itemBudgetLevel === priceRange) {
          score += 4;
          itemTags.add('vua_ngan_sach');
        }
      }

      // 2. Spiciness check across item name & all sub-dishes
      const hasSpicyKeywords = normalizedFullText.includes('cay') ||
                               normalizedFullText.includes('ot') ||
                               normalizedFullText.includes('sate') ||
                               normalizedFullText.includes('wasabi') ||
                               normalizedFullText.includes('tu xuyen') ||
                               normalizedFullText.includes('te cay');

      const spiciness = item.spicinessLevel ?? (hasSpicyKeywords ? 3 : 0);

      if (spiciness > maxSpiceAllowed) {
        score -= 30;
        const spicyDishMatches = (item.subDishes || []).filter(sd => {
          const normSd = sd.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return normSd.includes('cay') || normSd.includes('wasabi') || normSd.includes('tu xuyen') || normSd.includes('te cay');
        });
        if (spicyDishMatches.length > 0) {
          warnings.push(`🌶️ Chứa món cay: "${spicyDishMatches.join(', ')}" (vượt mức ăn cay: ${spiceTolerance})`);
        } else {
          warnings.push(`🌶️ Món cay (mức ${spiciness}/5) vượt mức chịu đựng của bạn`);
        }
      } else if (spiciness > 0 && maxSpiceAllowed > 0) {
        score += 3;
        itemTags.add('cay_vua_phai');
      }

      // 3. Disliked ingredients / Allergy check across full text and subDishes
      for (const disliked of lowerDisliked) {
        if (disliked && normalizedFullText.includes(disliked)) {
          score -= 35;
          const matchedSubDishes = (item.subDishes || []).filter(sd => {
            const normSd = sd.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normSd.includes(disliked);
          });
          if (matchedSubDishes.length > 0) {
            warnings.push(`⚠️ Có thể chứa thành phần bạn ghét/dị ứng: "${disliked}" (trong món: ${matchedSubDishes.join(', ')})`);
          } else {
            warnings.push(`⚠️ Có thể chứa thành phần bạn không thích: "${disliked}"`);
          }
        }
      }

      // 4. Dietary restrictions check (Chay / Vegetarian)
      const isVegetarianReq = lowerDietary.some(d => d.includes('chay') || d.includes('vegetarian'));
      const isItemVegetarian = item.isVegetarian || normalizedFullText.includes('chay') || itemTags.has('chay');

      if (isVegetarianReq && !isItemVegetarian) {
        score -= 50;
        warnings.push(`⛔ Món mặn — Không phù hợp chế độ ăn chay của bạn`);
      } else if (isVegetarianReq && isItemVegetarian) {
        score += 8;
        itemTags.add('phu_hop_an_chay');
      }

      const finalScore = Math.max(0, Math.min(100, score));
      const isRecommended = finalScore >= 60 && warnings.length === 0;

      let recommendationReason: string | undefined;
      if (isRecommended) {
        if (finalScore >= 90) {
          recommendationReason = '⭐ Siêu Phù Hợp - Rất hợp gu & chuẩn khẩu vị cá nhân';
        } else {
          recommendationReason = '👍 Phù Hợp - Hợp khẩu vị cá nhân';
        }
      } else if (warnings.length > 0) {
        recommendationReason = `⚠️ Cần lưu ý (${warnings.length} cảnh báo)`;
      }

      return {
        name: item.name,
        priceVND: item.priceVND ?? null,
        category: item.category || 'món chính',
        subDishes: item.subDishes || [],
        tags: Array.from(itemTags),
        matchScore: finalScore,
        isRecommended,
        warnings,
        recommendationReason
      };
    });
  }
}

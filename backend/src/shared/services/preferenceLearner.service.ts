import prisma from '../../shared/utils/prisma';

export type PreferenceAction =
  | { type: 'SPIN_ACCEPTED'; cuisine: string }
  | { type: 'SPIN_REROLL'; cuisine: string }
  | { type: 'LOCKET_RATED'; cuisine: string; rating: number }
  | { type: 'REVIEW_WRITTEN'; content: string };

export interface UserPreference {
  userId: string;
  cuisineScores: Record<string, number>;
  priceRange: number;
  dietaryRestrictions: string[];
  spiceTolerance: string;
  dislikedIngredients: string[];
}

export class PreferenceLearnerService {
  static async getOrCreate(userId: string): Promise<UserPreference> {
    let pref = await prisma.userPreference.findUnique({
      where: { userId }
    });
    
    if (!pref) {
      pref = await prisma.userPreference.create({
        data: {
          userId,
          cuisineScores: {},
          priceRange: 2,
          dietaryRestrictions: [],
          spiceTolerance: 'MEDIUM',
          dislikedIngredients: []
        }
      });
    }
    
    return {
      userId: pref.userId,
      cuisineScores: (pref.cuisineScores as Record<string, number>) || {},
      priceRange: pref.priceRange,
      dietaryRestrictions: (pref.dietaryRestrictions as string[]) || [],
      spiceTolerance: pref.spiceTolerance,
      dislikedIngredients: (pref.dislikedIngredients as string[]) || []
    };
  }
  
  static async updateFromAction(userId: string, action: PreferenceAction): Promise<void> {
    const pref = await this.getOrCreate(userId);
    const scores = { ...pref.cuisineScores };
    
    switch (action.type) {
      case 'SPIN_ACCEPTED':
        scores[action.cuisine] = Math.min((scores[action.cuisine] || 0) + 0.1, 1.0);
        break;
      case 'SPIN_REROLL':
        scores[action.cuisine] = Math.max((scores[action.cuisine] || 0) - 0.05, 0.0);
        break;
      case 'LOCKET_RATED':
        if (action.rating >= 4) {
          scores[action.cuisine] = Math.min((scores[action.cuisine] || 0) + 0.05, 1.0);
        }
        break;
      case 'REVIEW_WRITTEN': {
        const keywords = this.extractKeywords(action.content);
        for (const kw of keywords) {
          scores[kw] = Math.min((scores[kw] || 0) + 0.02, 1.0);
        }
        break;
      }
    }
    
    await prisma.userPreference.update({
      where: { userId },
      data: { cuisineScores: scores }
    });
  }
  
  private static extractKeywords(content: string): string[] {
    const normalized = content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    // Default dummy list of keywords to look for. Can be expanded based on exact cuisines.
    const possibleKeywords = ['mon chinh', 'do uong', 'khai vi', 'trang mieng', 'cay', 'chay', 'nuong', 'soup'];
    const found: string[] = [];
    
    for (const kw of possibleKeywords) {
      if (normalized.includes(kw)) {
        found.push(kw);
      }
    }
    
    return found;
  }
}

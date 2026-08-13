import prisma from '../../shared/utils/prisma';

export interface ExplicitPreferenceInput {
  priceRange?: number;  // 1-4
  dietaryRestrictions?: string[];
  spiceTolerance?: string;  // 'mild' | 'medium' | 'spicy'
  dislikedIngredients?: string[];
}

class PreferencesService {
  async getOrCreatePreference(userId: string) {
    try {
      let preference = await prisma.userPreference.findUnique({
        where: { userId }
      });

      if (!preference) {
        preference = await prisma.userPreference.create({
          data: {
            userId,
            cuisineScores: {},
            priceRange: 2,
            dietaryRestrictions: [],
            spiceTolerance: 'medium',
            dislikedIngredients: []
          }
        });
      }

      return preference;
    } catch (err) {
      console.log('[PreferencesService] DB unavailable, returning default preferences:', err);
      return {
        userId,
        cuisineScores: {},
        priceRange: 2,
        dietaryRestrictions: [],
        spiceTolerance: 'medium',
        dislikedIngredients: []
      };
    }
  }

  async updateExplicitPreference(userId: string, data: ExplicitPreferenceInput) {
    try {
      return await prisma.userPreference.upsert({
        where: { userId },
        update: {
          priceRange: data.priceRange,
          dietaryRestrictions: data.dietaryRestrictions,
          spiceTolerance: data.spiceTolerance,
          dislikedIngredients: data.dislikedIngredients,
        },
        create: {
          userId,
          cuisineScores: {},
          priceRange: data.priceRange || 2,
          dietaryRestrictions: data.dietaryRestrictions || [],
          spiceTolerance: data.spiceTolerance || 'medium',
          dislikedIngredients: data.dislikedIngredients || [],
        },
      });
    } catch (err) {
      console.log('[PreferencesService] DB unavailable, returning in-memory updated preferences:', err);
      return {
        userId,
        cuisineScores: {},
        priceRange: data.priceRange || 2,
        dietaryRestrictions: data.dietaryRestrictions || [],
        spiceTolerance: data.spiceTolerance || 'medium',
        dislikedIngredients: data.dislikedIngredients || [],
      };
    }
  }

  async resetPreference(userId: string) {
    try {
      return await prisma.userPreference.upsert({
        where: { userId },
        update: {
          cuisineScores: {}
        },
        create: {
          userId,
          cuisineScores: {},
          priceRange: 2,
          dietaryRestrictions: [],
          spiceTolerance: 'medium',
          dislikedIngredients: []
        }
      });
    } catch (err) {
      console.log('[PreferencesService] DB reset fallback:', err);
      return {
        userId,
        cuisineScores: {},
        priceRange: 2,
        dietaryRestrictions: [],
        spiceTolerance: 'medium',
        dislikedIngredients: []
      };
    }
  }
}

export const preferencesService = new PreferencesService();

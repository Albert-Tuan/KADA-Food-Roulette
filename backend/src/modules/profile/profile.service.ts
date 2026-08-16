import { prisma } from '../../shared/utils/prisma.js';

export interface UpdateProfileData {
  displayNamePrivate?: string;
  displayNamePublic?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserPreferencesData {
  cuisineScores?: Record<string, number>;
  priceRange?: number;
  dietaryRestrictions?: string[];
  spiceTolerance?: string;
  dislikedIngredients?: string[];
}

export interface CompleteOnboardingData {
  displayNamePrivate?: string;
  displayNamePublic?: string;
  avatarUrl?: string;
  bio?: string;
  preferences?: UserPreferencesData;
}

export const profileService = {
  getMyProfile: async (userId: string) => {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        preference: true,
        _count: {
          select: {
            friendshipsRequested: true,
            friendshipsReceived: true,
            lockets: true,
          }
        }
      }
    });
  },

  getPublicProfile: async (publicId: string) => {
    return prisma.user.findUnique({
      where: { publicId },
      select: {
        displayNamePublic: true,
        publicId: true,
        avatarUrl: true,
        bio: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        _count: {
          select: {
            friendshipsRequested: true,
            friendshipsReceived: true,
            lockets: {
              where: { visibility: 'PUBLIC', deletedAt: null }
            }
          }
        }
      }
    });
  },

  updateProfile: async (userId: string, data: UpdateProfileData) => {
    return prisma.user.update({
      where: { id: userId },
      data
    });
  },

  getPreferences: async (userId: string) => {
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
          spiceTolerance: 'medium',
          dislikedIngredients: []
        }
      });
    }
    return pref;
  },

  updatePreferences: async (userId: string, data: UserPreferencesData) => {
    return prisma.userPreference.upsert({
      where: { userId },
      create: {
        userId,
        cuisineScores: data.cuisineScores ?? {},
        priceRange: data.priceRange ?? 2,
        dietaryRestrictions: data.dietaryRestrictions ?? [],
        spiceTolerance: data.spiceTolerance ?? 'medium',
        dislikedIngredients: data.dislikedIngredients ?? []
      },
      update: {
        ...(data.cuisineScores !== undefined && { cuisineScores: data.cuisineScores }),
        ...(data.priceRange !== undefined && { priceRange: data.priceRange }),
        ...(data.dietaryRestrictions !== undefined && { dietaryRestrictions: data.dietaryRestrictions }),
        ...(data.spiceTolerance !== undefined && { spiceTolerance: data.spiceTolerance }),
        ...(data.dislikedIngredients !== undefined && { dislikedIngredients: data.dislikedIngredients })
      }
    });
  },

  completeOnboarding: async (userId: string, data: CompleteOnboardingData) => {
    // 1. Update user profile details and set isOnboarded = true
    const userUpdateData: {
      isOnboarded: boolean;
      displayNamePrivate?: string;
      displayNamePublic?: string;
      avatarUrl?: string;
      bio?: string;
    } = {
      isOnboarded: true
    };
    if (data.displayNamePrivate) userUpdateData.displayNamePrivate = data.displayNamePrivate;
    if (data.displayNamePublic) userUpdateData.displayNamePublic = data.displayNamePublic;
    if (data.avatarUrl) userUpdateData.avatarUrl = data.avatarUrl;
    if (data.bio) userUpdateData.bio = data.bio;

    const user = await prisma.user.update({
      where: { id: userId },
      data: userUpdateData
    });

    // 2. Upsert preferences if provided
    const preference = data.preferences
      ? await profileService.updatePreferences(userId, data.preferences)
      : await profileService.getPreferences(userId);

    return {
      user,
      preference
    };
  }
};

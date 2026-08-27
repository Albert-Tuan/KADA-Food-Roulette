import { Request, Response } from 'express';
import { profileService, UpdateProfileData } from './profile.service.js';
import { responseHelper } from '../../shared/utils/responseHelper.js';
import { UserApiError } from '../users/users.errors.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

function sendProfileError(res: Response, error: unknown) {
  if (error instanceof UserApiError) {
    return responseHelper.error(res, error.message, error.statusCode);
  }
  console.error('Profile request failed:', error);
  return responseHelper.error(res, 'Lỗi máy chủ.', 500);
}

export const profileController = {
  getMe: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa đăng nhập.', 401);
      }

      const profile = await profileService.getMyProfile(userId);
      return responseHelper.success(res, profile);
    } catch (error) {
      return sendProfileError(res, error);
    }
  },

  getPublicProfile: async (req: Request, res: Response) => {
    try {
      const publicId = Array.isArray(req.params.publicId) ? req.params.publicId[0] : req.params.publicId;
      if (!publicId) {
        return responseHelper.error(res, 'Vui lòng cung cấp publicId.', 400);
      }

      const profile = await profileService.getPublicProfile(publicId);
      return responseHelper.success(res, profile);
    } catch (error) {
      return sendProfileError(res, error);
    }
  },

  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa đăng nhập.', 401);
      }

      const { displayNamePrivate, displayNamePublic, bio, avatarUrl } = req.body;
      const data: UpdateProfileData = {};

      if (displayNamePrivate !== undefined) data.displayNamePrivate = displayNamePrivate;
      if (displayNamePublic !== undefined) data.displayNamePublic = displayNamePublic;
      if (bio !== undefined) data.bio = bio;
      if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;

      const updatedProfile = await profileService.updateProfile(userId, data);
      return responseHelper.success(res, updatedProfile);
    } catch (error) {
      return sendProfileError(res, error);
    }
  },

  getPreferences: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa đăng nhập.', 401);
      }

      const pref = await profileService.getPreferences(userId);
      return responseHelper.success(res, pref);
    } catch (error) {
      return sendProfileError(res, error);
    }
  },

  updatePreferences: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa đăng nhập.', 401);
      }

      const { cuisineScores, priceRange, dietaryRestrictions, spiceTolerance, dislikedIngredients } = req.body;
      const pref = await profileService.updatePreferences(userId, {
        cuisineScores,
        priceRange,
        dietaryRestrictions,
        spiceTolerance,
        dislikedIngredients
      });
      return responseHelper.success(res, pref);
    } catch (error) {
      return sendProfileError(res, error);
    }
  },

  completeOnboarding: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa đăng nhập.', 401);
      }

      const { displayNamePrivate, displayNamePublic, avatarUrl, bio, preferences } = req.body;
      const result = await profileService.completeOnboarding(userId, {
        displayNamePrivate,
        displayNamePublic,
        avatarUrl,
        bio,
        preferences
      });

      return responseHelper.success(res, result);
    } catch (error) {
      return sendProfileError(res, error);
    }
  }
};

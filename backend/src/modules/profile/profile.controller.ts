import { Request, Response } from 'express';
import { profileService, UpdateProfileData } from './profile.service';
import { responseHelper } from '../../shared/utils/responseHelper';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const profileController = {
  getMe: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa đăng nhập.', 401);
      }

      const profile = await profileService.getMyProfile(userId);
      if (!profile) {
        return responseHelper.error(res, 'Không tìm thấy người dùng.', 404);
      }

      return responseHelper.success(res, profile);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin cá nhân:', error);
      return responseHelper.error(res, 'Lỗi máy chủ.', 500);
    }
  },

  getPublicProfile: async (req: Request, res: Response) => {
    try {
      const publicId = Array.isArray(req.params.publicId) ? req.params.publicId[0] : req.params.publicId;
      if (!publicId) {
        return responseHelper.error(res, 'Vui lòng cung cấp publicId.', 400);
      }

      const profile = await profileService.getPublicProfile(publicId);
      if (!profile) {
        return responseHelper.error(res, 'Không tìm thấy hồ sơ.', 404);
      }

      return responseHelper.success(res, profile);
    } catch (error) {
      console.error('Lỗi khi lấy hồ sơ công khai:', error);
      return responseHelper.error(res, 'Lỗi máy chủ.', 500);
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
      console.error('Lỗi khi cập nhật hồ sơ:', error);
      return responseHelper.error(res, 'Lỗi máy chủ.', 500);
    }
  }
};

import { Response } from 'express';
import { friendsService } from './friends.service';
import { responseHelper } from '../../shared/utils/responseHelper';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

class FriendsController {
  async sendRequest(req: AuthRequest, res: Response) {
    try {
      const { targetPublicId, addresseeId, target } = req.body;
      const targetIdentifier = targetPublicId || addresseeId || target;
      if (!targetIdentifier) {
        return responseHelper.error(res, 'Vui lòng cung cấp ID, Public ID hoặc Email người dùng', 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa xác thực', 401);
      }

      const result = await friendsService.sendRequest(userId, targetIdentifier);
      return responseHelper.created(res, result);
    } catch (error: any) {
      return responseHelper.error(res, error.message, 400);
    }
  }

  async acceptRequest(req: AuthRequest, res: Response) {
    try {
      const friendshipId = Array.isArray(req.params.friendshipId) ? req.params.friendshipId[0] : req.params.friendshipId;
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa xác thực', 401);
      }

      const result = await friendsService.acceptRequest(userId, String(friendshipId));
      return responseHelper.success(res, result);
    } catch (error: any) {
      return responseHelper.error(res, error.message, 400);
    }
  }

  async rejectRequest(req: AuthRequest, res: Response) {
    try {
      const friendshipId = Array.isArray(req.params.friendshipId) ? req.params.friendshipId[0] : req.params.friendshipId;
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa xác thực', 401);
      }

      const result = await friendsService.rejectRequest(userId, String(friendshipId));
      return responseHelper.success(res, result);
    } catch (error: any) {
      return responseHelper.error(res, error.message, 400);
    }
  }

  async removeFriend(req: AuthRequest, res: Response) {
    try {
      const friendshipId = Array.isArray(req.params.friendshipId) ? req.params.friendshipId[0] : req.params.friendshipId;
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa xác thực', 401);
      }

      const result = await friendsService.removeFriend(userId, String(friendshipId));
      return responseHelper.success(res, result);
    } catch (error: any) {
      return responseHelper.error(res, error.message, 400);
    }
  }

  async getFriends(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa xác thực', 401);
      }

      const result = await friendsService.getFriends(userId);
      return responseHelper.success(res, result);
    } catch (error: any) {
      return responseHelper.error(res, error.message, 500);
    }
  }

  async getPendingRequests(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa xác thực', 401);
      }

      const result = await friendsService.getPendingRequests(userId);
      return responseHelper.success(res, result);
    } catch (error: any) {
      return responseHelper.error(res, error.message, 500);
    }
  }

  async searchUsers(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return responseHelper.error(res, 'Chưa xác thực', 401);
      }

      const query = String(req.query.q || '');
      const result = await friendsService.searchUsers(query, userId);
      return responseHelper.success(res, result);
    } catch (error: any) {
      return responseHelper.error(res, error.message, 500);
    }
  }
}

export const friendsController = new FriendsController();

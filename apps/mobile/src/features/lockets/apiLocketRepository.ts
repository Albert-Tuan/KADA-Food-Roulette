import { getApiErrorMessage, locketApi } from '@/api';
import { mapLocketDto } from './locketMapper';
import type { LocketRepository } from './repository';
import type { CreateLocketInput, Locket, LocketFeedFilter, UpdateLocketInput } from './types';

function getTasteBoardErrorMessage(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback).replace(/\bLockets?\b/gi, 'Taste Board');
}

class ApiLocketRepository implements LocketRepository {
  async getFeed(filter: LocketFeedFilter = 'ALL'): Promise<Locket[]> {
    try {
      return (await locketApi.list(filter)).map(mapLocketDto);
    } catch (error) {
      throw new Error(getTasteBoardErrorMessage(error, 'Chưa tải được feed Taste Board.'));
    }
  }

  async getById(id: string): Promise<Locket> {
    try {
      return mapLocketDto(await locketApi.get(id));
    } catch (error) {
      throw new Error(getTasteBoardErrorMessage(error, 'Không tìm thấy Taste Board.'));
    }
  }

  async create(input: CreateLocketInput): Promise<Locket> {
    if (input.mimeType === 'image/webp') {
      throw new Error('API hiện chỉ nhận ảnh JPEG hoặc PNG.');
    }
    try {
      return mapLocketDto(await locketApi.create({
        localImageUri: input.localImageUri,
        mimeType: input.mimeType,
        dishName: input.dishName,
        restaurantId: input.restaurantId,
        restaurantName: input.restaurantName,
        note: input.note,
        rating: input.rating,
        tags: input.tags,
        visibility: input.visibility,
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        capturedAt: input.capturedAt,
        deviceHash: input.deviceHash,
      }));
    } catch (error) {
      throw new Error(getTasteBoardErrorMessage(error, 'Không thể đăng Taste Board. Bạn thử lại nhé.'));
    }
  }

  async update(id: string, input: UpdateLocketInput): Promise<Locket> {
    try {
      return mapLocketDto(await locketApi.update(id, {
        dish_name: input.dishName,
        restaurant_id: input.restaurantId,
        restaurant_name: input.restaurantName,
        note: input.note,
        rating: input.rating,
        tags: input.tags,
        visibility: input.visibility,
      }));
    } catch (error) {
      throw new Error(getTasteBoardErrorMessage(error, 'Không thể cập nhật Taste Board.'));
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await locketApi.delete(id);
    } catch (error) {
      throw new Error(getTasteBoardErrorMessage(error, 'Không thể xóa Taste Board.'));
    }
  }
}

export const apiLocketRepository: LocketRepository = new ApiLocketRepository();

// Reviews API endpoints
import apiClient from '../client';

export interface Review {
  id: string;
  userId: string;
  user: {
    id: string;
    displayNamePrivate: string;
    publicId: string;
    avatarUrl?: string;
  };
  restaurantId?: string;
  restaurant?: {
    id: string;
    name: string;
  };
  rating: number;
  content?: string;
  imageUrl?: string;
  visibility: 'private' | 'friends' | 'public';
  createdAt: string;
  tags?: string[];
  helpfulCount?: number;
  isVerifiedVisit?: boolean;
  overallRating?: number;
  tasteRating?: number;
  serviceRating?: number;
  ambienceRating?: number;
  valueRating?: number;
  author?: {
    displayNamePublic: string;
  };
}

export interface CreateReviewDto {
  restaurantId?: string;
  rating?: number; // Backend expects rating
  overallRating?: number; // Mobile app uses overallRating
  tasteRating?: number;
  serviceRating?: number;
  ambienceRating?: number;
  valueRating?: number;
  content?: string;
  imageUrl?: string;
  tags?: string[];
  visibility?: 'private' | 'friends' | 'public';
}

export interface ReviewsListResponse {
  reviews: Review[];
  total: number;
  summary?: {
    avgOverall?: number;
    total: number;
  };
}

export interface ReviewFilters {
  restaurantId?: string;
  userId?: string;
  page?: number;
}

export const reviewsApi = {
  list: async (filters: ReviewFilters): Promise<ReviewsListResponse> => {
    const response = await apiClient.get<ReviewsListResponse>('/reviews', { params: filters });
    return response.data;
  },

  create: async (data: CreateReviewDto): Promise<Review> => {
    const response = await apiClient.post<Review>('/reviews', data);
    return response.data;
  },

  listByRestaurant: async (restaurantId: string, sort?: string): Promise<ReviewsListResponse> => {
    const response = await apiClient.get<ReviewsListResponse>('/reviews', { params: { restaurantId, sort } });
    return response.data;
  },

  markHelpful: async (id: string): Promise<void> => {
    await apiClient.post(`/reviews/${id}/helpful`);
  },
};

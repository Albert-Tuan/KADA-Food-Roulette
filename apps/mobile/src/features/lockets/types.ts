export type LocketVisibility = 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
export type LocketFeedFilter = 'ALL' | 'MINE' | 'FRIENDS' | 'DISCOVER';

export interface LocketAuthor {
  id: string;
  publicId: string;
  displayNamePublic: string;
  avatarUrl?: string;
}

export interface LocketLocation {
  latitude: number;
  longitude: number;
}

export interface LocketPermissions {
  canDelete: boolean;
  canEdit: boolean;
}

export interface LocketLikeState {
  likeCount: number;
  isLiked: boolean;
}

export interface Locket {
  id: string;
  ownerId: string;
  author: LocketAuthor;
  imageUrl: string;
  dishName?: string;
  restaurantId?: string;
  restaurantName?: string;
  note?: string;
  rating?: number;
  tags?: string[];
  likeCount: number;
  isLiked: boolean;
  visibility: LocketVisibility;
  capturedAt: string;
  location?: LocketLocation;
  canDisplayLocation: boolean;
  permissions: LocketPermissions;
  createdAt: string;
}

export interface CreateLocketInput {
  localImageUri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  dishName?: string;
  restaurantId?: string;
  restaurantName?: string;
  note?: string;
  rating?: number;
  tags?: string[];
  visibility: LocketVisibility;
  capturedAt: string;
  location: LocketLocation;
  deviceHash: string;
}

export interface UpdateLocketInput {
  dishName?: string;
  restaurantId?: string | null;
  restaurantName?: string | null;
  note?: string | null;
  rating?: number | null;
  tags?: string[];
  visibility?: LocketVisibility;
}

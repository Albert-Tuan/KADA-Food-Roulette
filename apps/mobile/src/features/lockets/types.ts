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

export interface Locket {
  id: string;
  ownerId: string;
  author: LocketAuthor;
  imageUrl: string;
  dishName: string;
  restaurantName?: string;
  note?: string;
  rating: number;
  tags: string[];
  visibility: LocketVisibility;
  capturedAt: string;
  location?: LocketLocation;
  canDisplayLocation: boolean;
  createdAt: string;
}

export interface CreateLocketInput {
  localImageUri: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  dishName: string;
  restaurantId?: string;
  restaurantName?: string;
  note?: string;
  rating: number;
  tags: string[];
  visibility: LocketVisibility;
  capturedAt: string;
  location: LocketLocation;
  deviceHash: string;
}

export type UpdateLocketInput = Partial<
  Pick<Locket, 'dishName' | 'restaurantName' | 'note' | 'rating' | 'tags' | 'visibility'>
>;

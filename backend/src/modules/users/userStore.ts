export interface InMemoryUser {
  id: string;
  email: string;
  displayNamePrivate: string;
  displayNamePublic: string;
  publicId: string;
  avatarUrl: string | null;
  bio?: string | null;
  xp?: number;
  streakDays?: number;
  coins?: number;
  role?: string;
  createdAt: Date | string;
}

export const inMemoryUserStore = new Map<string, InMemoryUser>();
export const inMemoryUserStoreByEmail = new Map<string, InMemoryUser>();

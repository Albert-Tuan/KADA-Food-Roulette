import { CURRENT_USER_ID, locketRepository } from '@/features/lockets';
import type { ProfileRepository } from './repository';
import type { PrivateProfile, PublicProfile, UpdateProfileInput } from './types';

let myProfile: Omit<PrivateProfile, 'publicLockets' | 'stats'> = {
  id: CURRENT_USER_ID,
  publicId: 'gia-binh-food',
  displayNamePublic: 'Bình Ăn Gì',
  displayNamePrivate: 'Bình',
  email: 'binh@example.com',
  avatarUrl: 'https://i.pravatar.cc/240?img=12',
  bio: 'Mình thích tìm những quán nhỏ có món Việt thật ngon.',
};

const publicPeople: Record<string, Omit<PublicProfile, 'publicLockets' | 'stats'>> = {
  'minh-an': {
    id: 'friend-1',
    publicId: 'minh-an',
    displayNamePublic: 'Minh An',
    avatarUrl: 'https://i.pravatar.cc/240?img=47',
    bio: 'Ăn cay vừa đủ, mê bún và những quán gia đình.',
  },
  'lan-chi': {
    id: 'discover-1',
    publicId: 'lan-chi',
    displayNamePublic: 'Lan Chi',
    avatarUrl: 'https://i.pravatar.cc/240?img=32',
    bio: 'Ghi lại những món mình muốn ăn lần nữa.',
  },
};

function createStats(locketCount: number) {
  return { locketCount, checkInCount: 8, groupCount: 3 };
}

class MockProfileRepository implements ProfileRepository {
  async getPublicProfile(publicId: string): Promise<PublicProfile> {
    const base = publicId === myProfile.publicId ? myProfile : publicPeople[publicId];
    if (!base) throw new Error('Không tìm thấy profile.');

    const publicLockets = (await locketRepository.getFeed('DISCOVER')).filter(
      (locket) => locket.author.publicId === publicId && locket.visibility === 'PUBLIC',
    );
    return {
      id: base.id,
      publicId: base.publicId,
      displayNamePublic: base.displayNamePublic,
      avatarUrl: base.avatarUrl,
      bio: base.bio,
      stats: createStats(publicLockets.length),
      publicLockets,
    };
  }

  async getMyProfile(): Promise<PrivateProfile> {
    const publicProfile = await this.getPublicProfile(myProfile.publicId);
    return { ...myProfile, ...publicProfile };
  }

  async updateProfile(input: UpdateProfileInput): Promise<PrivateProfile> {
    const privateName = input.displayNamePrivate?.trim();
    const publicName = input.displayNamePublic?.trim();
    const bio = input.bio?.trim();
    if (privateName !== undefined && (privateName.length < 2 || privateName.length > 50)) {
      throw new Error('Tên trong nhóm phải có từ 2 đến 50 ký tự.');
    }
    if (publicName !== undefined && (publicName.length < 2 || publicName.length > 50)) {
      throw new Error('Tên công khai phải có từ 2 đến 50 ký tự.');
    }
    if (bio !== undefined && bio.length > 160) {
      throw new Error('Bio tối đa 160 ký tự.');
    }
    myProfile = {
      ...myProfile,
      ...(input.avatarUri ? { avatarUrl: input.avatarUri } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(privateName !== undefined ? { displayNamePrivate: privateName } : {}),
      ...(publicName !== undefined ? { displayNamePublic: publicName } : {}),
    };
    return this.getMyProfile();
  }
}

export const profileRepository: ProfileRepository = new MockProfileRepository();

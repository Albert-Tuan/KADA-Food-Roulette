import { describe, expect, it } from 'vitest';
import { parseUpdateProfile, validatePublicId } from './users.validation.js';

describe('Profile request validation', () => {
  it('normalizes allowed profile fields', () => {
    expect(parseUpdateProfile({
      display_name_private: '  Bình  ',
      display_name_public: ' Bình Ăn Gì ',
      bio: ' Mê món Việt ',
    })).toEqual({
      displayNamePrivate: 'Bình',
      displayNamePublic: 'Bình Ăn Gì',
      bio: 'Mê món Việt',
    });
  });

  it('keeps public_id immutable', () => {
    expect(() => parseUpdateProfile({ public_id: 'new-id' })).toThrowError('Public ID không thể thay đổi');
  });

  it('fails closed while avatar storage is pending', () => {
    expect(() => parseUpdateProfile({ avatar_uri: 'file:///avatar.jpg' })).toThrowError('Supabase Storage');
  });

  it('rejects malformed public IDs as not found', () => {
    expect(() => validatePublicId('../private')).toThrowError('Không tìm thấy profile');
  });
});

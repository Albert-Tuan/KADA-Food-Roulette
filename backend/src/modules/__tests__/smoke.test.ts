import { describe, it, expect } from 'vitest';
import { isPasswordStrong, hashPassword, comparePassword } from '../../utils/hash';
import { generateAccessToken, verifyToken } from '../../utils/jwt';

describe('Backend smoke tests', () => {
  describe('hash utils', () => {
    it('rejects weak passwords', () => {
      expect(isPasswordStrong('short')).toBe(false);
      expect(isPasswordStrong('alllowercase')).toBe(false);
      expect(isPasswordStrong('ALLUPPERCASE')).toBe(false);
      expect(isPasswordStrong('NoDigits!')).toBe(false);
    });

    it('accepts strong passwords', () => {
      expect(isPasswordStrong('Strong1Pass')).toBe(true);
      expect(isPasswordStrong('Abcdef12')).toBe(true);
    });

    it('hashes and verifies a password roundtrip', async () => {
      const hash = await hashPassword('Strong1Pass');
      expect(hash).not.toBe('Strong1Pass');
      expect(await comparePassword('Strong1Pass', hash)).toBe(true);
      expect(await comparePassword('wrong', hash)).toBe(false);
    });
  });

  describe('jwt utils', () => {
    it('signs and verifies a token', () => {
      const token = generateAccessToken({ userId: 'user-123' });
      const payload = verifyToken(token) as { userId: string };
      expect(payload.userId).toBe('user-123');
    });

    it('rejects tampered tokens', () => {
      const token = generateAccessToken({ userId: 'user-123' });
      const tampered = token.slice(0, -2) + 'xx';
      expect(() => verifyToken(tampered)).toThrow();
    });
  });
});
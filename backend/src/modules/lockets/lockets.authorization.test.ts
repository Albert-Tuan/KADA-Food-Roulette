import { LocketVisibility } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { canViewLocket } from './lockets.service.js';

describe('Locket visibility authorization', () => {
  it('allows anyone to view public lockets', () => {
    expect(canViewLocket({ userId: 'owner', visibility: LocketVisibility.PUBLIC }, undefined, new Set())).toBe(true);
  });

  it('allows only the owner to view private lockets', () => {
    const locket = { userId: 'owner', visibility: LocketVisibility.PRIVATE };
    expect(canViewLocket(locket, 'owner', new Set())).toBe(true);
    expect(canViewLocket(locket, 'viewer', new Set(['owner']))).toBe(false);
  });

  it('requires an accepted friendship for friends lockets', () => {
    const locket = { userId: 'owner', visibility: LocketVisibility.FRIENDS };
    expect(canViewLocket(locket, 'viewer', new Set(['owner']))).toBe(true);
    expect(canViewLocket(locket, 'viewer', new Set())).toBe(false);
    expect(canViewLocket(locket, undefined, new Set())).toBe(false);
  });
});

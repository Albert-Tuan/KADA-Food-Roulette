import { describe, it, expect } from 'vitest';
import { PersonalizationService } from '../personalization.service.js';

describe('PersonalizationService', () => {
  it('correctly scores items and adds warnings for spicy foods when user tolerance is low', () => {
    const rawItems = [
      { name: 'Cơm chiên hải sản cay', priceVND: 50000, category: 'món chính', spicinessLevel: 4, tags: ['cay'] },
      { name: 'Cơm tấm sườn bì chả', priceVND: 45000, category: 'món chính', spicinessLevel: 0, tags: [] },
    ];

    const preferences = {
      spiceTolerance: 'none',
      dietaryRestrictions: [],
      dislikedIngredients: [],
    };

    const results = PersonalizationService.personalizeMenuItems(rawItems, preferences);

    expect(results.length).toBe(2);
    // Spicy item should have warnings and lower score
    const spicyItem = results.find(i => i.name.includes('cay'));
    expect(spicyItem).toBeDefined();
    expect(spicyItem?.warnings.length).toBeGreaterThan(0);
    expect(spicyItem?.matchScore).toBeLessThan(60);

    // Non-spicy item should be recommended
    const normalItem = results.find(i => i.name.includes('tấm'));
    expect(normalItem).toBeDefined();
    expect(normalItem?.isRecommended).toBe(true);
    expect(normalItem?.matchScore).toBeGreaterThanOrEqual(60);
  });

  it('flags disliked ingredients correctly', () => {
    const rawItems = [
      { name: 'Bún bò Huế nhiều hành', priceVND: 55000, category: 'món chính' },
    ];

    const preferences = {
      spiceTolerance: 'medium',
      dietaryRestrictions: [],
      dislikedIngredients: ['hành'],
    };

    const results = PersonalizationService.personalizeMenuItems(rawItems, preferences);
    expect(results[0].warnings.some(w => w.includes('hành'))).toBe(true);
  });

  it('flags non-vegetarian items when user requires vegetarian food', () => {
    const rawItems = [
      { name: 'Bún chả Hà Nội', priceVND: 45000, category: 'món chính', isVegetarian: false },
      { name: 'Bún chay nấm xào', priceVND: 35000, category: 'món chính', isVegetarian: true },
    ];

    const preferences = {
      spiceTolerance: 'medium',
      dietaryRestrictions: ['chay'],
      dislikedIngredients: [],
    };

    const results = PersonalizationService.personalizeMenuItems(rawItems, preferences);

    const meatItem = results.find(i => i.name.includes('chả'));
    const vegItem = results.find(i => i.name.includes('chay'));

    expect(meatItem?.warnings.some(w => w.includes('ăn chay'))).toBe(true);
    expect(vegItem?.isRecommended).toBe(true);
  });
});

import type { Locket } from './types';

export type TasteBoardCategory = 'all' | 'pho' | 'bun' | 'banhmi' | 'cuon' | 'drink' | 'bbq';

const CATEGORY_KEYWORDS: Record<Exclude<TasteBoardCategory, 'all'>, string[]> = {
  pho: ['pho'],
  bun: ['bun'],
  banhmi: ['banh mi'],
  cuon: ['cuon', 'goi cuon', 'bo bia'],
  drink: ['tra sua', 'ca phe', 'cafe', 'coffee'],
  bbq: ['lau', 'nuong', 'bbq'],
};

function normalizeFoodText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function containsKeyword(text: string, keyword: string): boolean {
  return (' ' + text + ' ').includes(' ' + keyword + ' ');
}

export function matchesTasteBoardCategory(locket: Locket, category: TasteBoardCategory): boolean {
  if (category === 'all') return true;
  const searchableText = normalizeFoodText([
    locket.dishName,
    locket.restaurantName,
    locket.note,
    ...(locket.tags ?? []),
  ].filter((value): value is string => Boolean(value)).join(' '));
  return CATEGORY_KEYWORDS[category].some((keyword) => containsKeyword(searchableText, keyword));
}

export function filterTasteBoardsByCategory(
  lockets: Locket[],
  category: TasteBoardCategory,
): Locket[] {
  return lockets.filter((locket) => matchesTasteBoardCategory(locket, category));
}

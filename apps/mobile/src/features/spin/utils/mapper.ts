import type { Restaurant as SpinRestaurant } from '../types';

export const mapBackendRestaurantToSpinCandidate = (backendData: any): SpinRestaurant => {
  // Convert priceLevel string ("$$") to number (1-4)
  let priceLevel: 1 | 2 | 3 | 4 = 1;
  if (backendData.priceLevel === '$$') priceLevel = 2;
  else if (backendData.priceLevel === '$$$') priceLevel = 3;
  else if (backendData.priceLevel === '$$$$') priceLevel = 4;
  else if (typeof backendData.priceLevel === 'number') {
     // fallback if it was already number
     priceLevel = Math.min(Math.max(backendData.priceLevel, 1), 4) as 1 | 2 | 3 | 4;
  }

  // Convert dietary properties to tags array
  const dietary: string[] = [];
  if (backendData.isVegetarian) dietary.push('Chay');
  if (backendData.isSpicy) dietary.push('Cay');
  if (backendData.tasteNote) dietary.push(backendData.tasteNote);

  return {
    id: backendData.id || `temp-${Date.now()}`,
    name: backendData.name || 'Quán ăn chưa biết',
    category: backendData.cuisineType || backendData.category || 'Ăn uống',
    rating: backendData.rating || backendData.ratingAvg || 0,
    totalReviews: backendData.reviewCount || backendData.ratingCount || 0,
    distance: (backendData.distanceKm || 0) * 1000 || backendData.distance || 0,
    priceLevel,
    imageUrl: backendData.photoUrl || (backendData.photos && backendData.photos[0]) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    dietary,
  };
};

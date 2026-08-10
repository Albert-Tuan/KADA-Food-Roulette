import prisma from '../../shared/utils/prisma';

const PRICE_THRESHOLDS: Record<number, number> = {
  1: 50000,
  2: 150000,
  3: 300000,
  4: Infinity,
};

const SPICE_LEVELS: Record<string, number> = {
  mild: 1,
  medium: 2,
  spicy: 3,
};

export interface MenuItemInput {
  id: string;
  name: string;
  priceVND?: number;
  category?: string;
  tags?: string[];
}

export interface MemberScore {
  userId: string;
  userName: string;
  topItem: MenuItemInput;
  matchScore: number;
  reasons: string[];
  alternativeItems: MenuItemInput[];
}

class CircleService {
  async generateRecommendation(groupId: string, menuItems: MenuItemInput[], spinSessionId?: string) {
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          include: {
            preference: true
          }
        }
      }
    });

    const memberScores: MemberScore[] = [];

    for (const member of groupMembers) {
      if (!member.user.preference) continue;
      
      const pref = member.user.preference;
      
      const itemScores = menuItems.map(item => {
        const score = this.calculateMatchScore(item, pref);
        const reasons = this.generateReasons(item, pref);
        return { item, score, reasons };
      });

      itemScores.sort((a, b) => b.score - a.score);

      if (itemScores.length > 0) {
        memberScores.push({
          userId: member.userId,
          userName: member.user.displayNamePrivate || member.user.email,
          topItem: itemScores[0].item,
          matchScore: itemScores[0].score,
          reasons: itemScores[0].reasons,
          alternativeItems: itemScores.slice(1, 4).map(s => s.item)
        });
      }
    }

    const recommendation = await prisma.circleRecommendation.create({
      data: {
        groupId,
        spinSessionId,
        memberScores: memberScores as any
      }
    });

    return recommendation;
  }

  private calculateMatchScore(item: MenuItemInput, pref: any): number {
    const cuisineScores = (pref.cuisineScores as Record<string, number>) || {};
    const cuisineMatch = item.category && cuisineScores[item.category] ? cuisineScores[item.category] : 0.5;
    
    let priceMatch = 0;
    const threshold = PRICE_THRESHOLDS[pref.priceRange || 2] || 150000;
    if (item.priceVND) {
      if (item.priceVND <= threshold) {
        priceMatch = 1;
      } else if (item.priceVND <= threshold * 1.5) {
        priceMatch = 0.5;
      }
    } else {
      priceMatch = 0.8;
    }

    let dietaryMatch = 1;
    const disliked = (pref.dislikedIngredients as string[]) || [];
    if (item.tags && disliked.length > 0) {
      const hasDisliked = item.tags.some(tag => disliked.includes(tag.toLowerCase()));
      if (hasDisliked) {
        dietaryMatch = 0;
      }
    }

    let spiceMatch: number;
    const itemIsSpicy = item.tags?.includes('cay');
    const userSpiceLevel = SPICE_LEVELS[pref.spiceTolerance || 'medium'] || 2;
    
    if (itemIsSpicy) {
      if (userSpiceLevel === 3) spiceMatch = 1;
      else if (userSpiceLevel === 2) spiceMatch = 0.5;
      else spiceMatch = 0;
    } else {
      if (userSpiceLevel === 1) spiceMatch = 1;
      else spiceMatch = 0.8;
    }

    return cuisineMatch * 0.4 + priceMatch * 0.3 + dietaryMatch * 0.2 + spiceMatch * 0.1;
  }

  private generateReasons(item: MenuItemInput, pref: any): string[] {
    const reasons: string[] = [];
    
    const cuisineScores = (pref.cuisineScores as Record<string, number>) || {};
    if (item.category && cuisineScores[item.category] && cuisineScores[item.category] > 0.7) {
      reasons.push(`Bạn thích món ${item.category}`);
    }

    const threshold = PRICE_THRESHOLDS[pref.priceRange || 2] || 150000;
    if (item.priceVND && item.priceVND <= threshold) {
      reasons.push('Trong budget của bạn');
    }

    const disliked = (pref.dislikedIngredients as string[]) || [];
    const hasDisliked = item.tags?.some(tag => disliked.includes(tag.toLowerCase()));
    if (!hasDisliked && disliked.length > 0) {
      reasons.push('Phù hợp chế độ ăn của bạn');
    }

    if (item.tags?.includes('cay') && pref.spiceTolerance === 'spicy') {
      reasons.push('Bạn thích món cay đúng không?');
    }

    return reasons;
  }

  async getRecommendationById(id: string) {
    return prisma.circleRecommendation.findUnique({
      where: { id }
    });
  }
}

export const circleService = new CircleService();

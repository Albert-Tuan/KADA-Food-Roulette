export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalReviews: number;
  distance: number;
  priceLevel: 1 | 2 | 3 | 4;
  imageUrl: string;
  dietary?: string[];
}

export interface SpinFilters {
  maxDistance: number;
  maxPriceVND: number;
  categories: string[];
  dietary: string[];
}

export interface CustomCandidate {
  id: string;
  name: string;
}

export interface GroupMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: 'HOST' | 'MEMBER';
}

export type VoteDecision = 'ACCEPT' | 'RESPIN' | 'VETO' | null;

export interface GroupVote {
  memberId: string;
  decision: VoteDecision;
}

export type GroupPhase = 'LOBBY' | 'SPINNING' | 'VOTING' | 'RESULT';

export interface MemberScore {
  userId: string;
  userName: string;
  topItem: {
    name: string;
    priceVND: number;
    category: string;
    tags: string[];
  };
  matchScore: number;
  reasons: string[];
  alternativeItems: { name: string }[];
}

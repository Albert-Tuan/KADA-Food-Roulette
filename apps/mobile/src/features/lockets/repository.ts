import type {
  CreateLocketInput,
  Locket,
  LocketFeedFilter,
  LocketLikeState,
  UpdateLocketInput,
} from './types';

export interface LocketRepository {
  getFeed(filter?: LocketFeedFilter): Promise<Locket[]>;
  getById(id: string): Promise<Locket>;
  create(input: CreateLocketInput): Promise<Locket>;
  update(id: string, input: UpdateLocketInput): Promise<Locket>;
  setLiked(id: string, liked: boolean): Promise<LocketLikeState>;
  delete(id: string): Promise<void>;
}

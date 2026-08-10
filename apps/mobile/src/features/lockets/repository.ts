import type {
  CreateLocketInput,
  Locket,
  LocketFeedFilter,
  UpdateLocketInput,
} from './types';

export interface LocketRepository {
  getFeed(filter?: LocketFeedFilter): Promise<Locket[]>;
  getById(id: string): Promise<Locket>;
  create(input: CreateLocketInput): Promise<Locket>;
  update(id: string, input: UpdateLocketInput): Promise<Locket>;
  delete(id: string): Promise<void>;
}

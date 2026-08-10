import { apiLocketRepository } from './apiLocketRepository';
import { mockLocketRepository } from './mockLocketRepository';

const useMockRepositories = process.env.EXPO_PUBLIC_USE_MOCK_REPOSITORIES === 'true';

export const locketRepository = useMockRepositories ? mockLocketRepository : apiLocketRepository;

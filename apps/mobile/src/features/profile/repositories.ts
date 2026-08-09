import { apiProfileRepository } from './apiProfileRepository';
import { mockProfileRepository } from './mockProfileRepository';

const useMockRepositories = process.env.EXPO_PUBLIC_USE_MOCK_REPOSITORIES === 'true';

export const profileRepository = useMockRepositories ? mockProfileRepository : apiProfileRepository;

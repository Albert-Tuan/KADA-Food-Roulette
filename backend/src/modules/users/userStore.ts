import fs from 'fs';
import path from 'path';

export interface InMemoryUser {
  id: string;
  email: string;
  passwordHash?: string;
  displayNamePrivate: string;
  displayNamePublic: string;
  publicId: string;
  avatarUrl: string | null;
  bio?: string | null;
  xp?: number;
  streakDays?: number;
  coins?: number;
  role?: string;
  isOnboarded?: boolean;
  createdAt: Date | string;
}

export const inMemoryUserStore = new Map<string, InMemoryUser>();
export const inMemoryUserStoreByEmail = new Map<string, InMemoryUser>();

export const SEED_USERS: InMemoryUser[] = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'locket-test@foodroulette.app',
    passwordHash: '$2b$10$7vIqKk54/3y8Hw1gQpM1ve8m8XGZ5UjF7D9T.8X.K7eM5A5w6qU6e', // password123
    displayNamePrivate: 'Food Roulette Tester',
    displayNamePublic: 'Tester Sành Ăn',
    publicId: 'u_tester2026',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    bio: 'Đam mê ẩm thực ba miền và khám phá quán mới!',
    isOnboarded: true,
    role: 'USER',
    createdAt: new Date(),
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'friend@foodroulette.app',
    passwordHash: '$2b$10$7vIqKk54/3y8Hw1gQpM1ve8m8XGZ5UjF7D9T.8X.K7eM5A5w6qU6e', // password123
    displayNamePrivate: 'Demo Friend',
    displayNamePublic: 'Bạn Thân Ăn Uống',
    publicId: 'u_friend2026',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
    bio: 'Ăn là chân ái!',
    isOnboarded: true,
    role: 'USER',
    createdAt: new Date(),
  },
];

const DATA_DIR = path.resolve(process.cwd(), '.app_data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

export function saveUser(user: InMemoryUser) {
  inMemoryUserStore.set(user.id, user);
  inMemoryUserStoreByEmail.set(user.email.toLowerCase(), user);

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const allUsers = Array.from(inMemoryUserStore.values());
    fs.writeFileSync(USERS_FILE, JSON.stringify(allUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('[UserStore] Error persisting user to disk:', err);
  }
}

export function loadUsersFromDisk() {
  // Load seeds first
  for (const u of SEED_USERS) {
    inMemoryUserStore.set(u.id, u);
    inMemoryUserStoreByEmail.set(u.email.toLowerCase(), u);
  }

  // Load persisted from disk
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed: InMemoryUser[] = JSON.parse(data);
      for (const u of parsed) {
        inMemoryUserStore.set(u.id, u);
        inMemoryUserStoreByEmail.set(u.email.toLowerCase(), u);
      }
      console.log(`[UserStore] Loaded ${parsed.length} persisted users from disk.`);
    }
  } catch (err) {
    console.error('[UserStore] Error loading users from disk:', err);
  }
}

// Initial load
loadUsersFromDisk();

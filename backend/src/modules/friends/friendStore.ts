import fs from 'fs';
import path from 'path';

export interface PersistedFriendship {
  id: string;
  requesterId?: string;
  addresseeId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt?: string;
}

const DATA_DIR = path.resolve(process.cwd(), '.app_data');
const FRIENDSHIPS_FILE = path.join(DATA_DIR, 'friendships.json');

export const inMemoryFriendships = new Map<string, PersistedFriendship>();

export function saveFriendship(f: PersistedFriendship) {
  inMemoryFriendships.set(f.id, f);
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const all = Array.from(inMemoryFriendships.values());
    fs.writeFileSync(FRIENDSHIPS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('[FriendStore] Error saving friendship to disk:', err);
  }
}

export function removePersistedFriendship(id: string) {
  inMemoryFriendships.delete(id);
  try {
    if (!fs.existsSync(DATA_DIR)) return;
    const all = Array.from(inMemoryFriendships.values());
    fs.writeFileSync(FRIENDSHIPS_FILE, JSON.stringify(all, null, 2), 'utf-8');
  } catch (err) {
    console.error('[FriendStore] Error removing friendship from disk:', err);
  }
}

export function loadFriendshipsFromDisk() {
  try {
    if (fs.existsSync(FRIENDSHIPS_FILE)) {
      const data = fs.readFileSync(FRIENDSHIPS_FILE, 'utf-8');
      const parsed: PersistedFriendship[] = JSON.parse(data);
      for (const f of parsed) {
        inMemoryFriendships.set(f.id, f);
      }
      console.log(`[FriendStore] Loaded ${parsed.length} persisted friendships from disk.`);
    }
  } catch (err) {
    console.error('[FriendStore] Error loading friendships from disk:', err);
  }
}

loadFriendshipsFromDisk();

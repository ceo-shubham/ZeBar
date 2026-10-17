import fs from 'fs';
import path from 'path';
import { User, QRCodeItem, PlatformStats } from '@/types';

export const OWNER_EMAIL = 'ceo.shubhampathak@gmail.com';

interface DatabaseSchema {
  users: User[];
  qrs: QRCodeItem[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'zebar.json');

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: [
        {
          id: 'user_owner_shubham',
          email: OWNER_EMAIL,
          name: 'Shubham Pathak',
          avatar: '',
          role: 'VIP_OWNER',
          firstLoginAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          qrCount: 0,
        },
      ],
      qrs: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read db file, re-initializing:', err);
    const fallback: DatabaseSchema = { users: [], qrs: [] };
    return fallback;
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error saving db file:', err);
  }
}

// User Methods
export function upsertUser(email: string, name: string, avatar: string = ''): { user: User; isFirstLogin: boolean } {
  const db = ensureDbFile();
  const normalizedEmail = email.trim().toLowerCase();
  const isOwner = normalizedEmail === OWNER_EMAIL.toLowerCase();

  const existingIndex = db.users.findIndex((u) => u.email.toLowerCase() === normalizedEmail);

  if (existingIndex >= 0) {
    const existing = db.users[existingIndex];
    const updated: User = {
      ...existing,
      name: name || existing.name,
      avatar: avatar || existing.avatar,
      role: isOwner ? 'VIP_OWNER' : existing.role || 'USER',
      lastLoginAt: new Date().toISOString(),
    };
    db.users[existingIndex] = updated;
    writeDb(db);
    return { user: updated, isFirstLogin: false };
  } else {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      avatar,
      role: isOwner ? 'VIP_OWNER' : 'USER',
      firstLoginAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      qrCount: 0,
    };
    db.users.push(newUser);
    writeDb(db);
    return { user: newUser, isFirstLogin: true };
  }
}

export function getUserByEmail(email: string): User | null {
  const db = ensureDbFile();
  const normalizedEmail = email.trim().toLowerCase();
  return db.users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
}

export function getUserById(id: string): User | null {
  const db = ensureDbFile();
  return db.users.find((u) => u.id === id) || null;
}

export function getAllUsers(): User[] {
  const db = ensureDbFile();
  return [...db.users].sort(
    (a, b) => new Date(b.firstLoginAt).getTime() - new Date(a.firstLoginAt).getTime()
  );
}

export function searchUsers(query: string): User[] {
  const db = ensureDbFile();
  const q = query.trim().toLowerCase();
  if (!q) return getAllUsers();
  return db.users
    .filter((u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
    .sort((a, b) => new Date(b.firstLoginAt).getTime() - new Date(a.firstLoginAt).getTime());
}

// QR Code Methods
export function createQR(qrData: Omit<QRCodeItem, 'id' | 'createdAt' | 'updatedAt' | 'scanCount'>): QRCodeItem {
  const db = ensureDbFile();
  const id = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const newQR: QRCodeItem = {
    ...qrData,
    id,
    scanCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  db.qrs.unshift(newQR);

  // Update user's QR count
  const user = db.users.find((u) => u.id === qrData.userId || u.email.toLowerCase() === qrData.userEmail.toLowerCase());
  if (user) {
    user.qrCount = (user.qrCount || 0) + 1;
  }

  writeDb(db);
  return newQR;
}

export function getUserQRs(userIdOrEmail: string): QRCodeItem[] {
  const db = ensureDbFile();
  const target = userIdOrEmail.toLowerCase();
  return db.qrs
    .filter((q) => q.userId === userIdOrEmail || q.userEmail.toLowerCase() === target)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getQRById(id: string, incrementScan: boolean = false): QRCodeItem | null {
  const db = ensureDbFile();
  const item = db.qrs.find((q) => q.id === id);
  if (!item) return null;

  if (incrementScan) {
    item.scanCount = (item.scanCount || 0) + 1;
    writeDb(db);
  }

  return item;
}

export function deleteQR(id: string, userIdOrEmail: string, isAdmin: boolean = false): boolean {
  const db = ensureDbFile();
  const index = db.qrs.findIndex((q) => q.id === id);
  if (index === -1) return false;

  const target = userIdOrEmail.toLowerCase();
  const item = db.qrs[index];

  if (!isAdmin && item.userId !== userIdOrEmail && item.userEmail.toLowerCase() !== target) {
    return false;
  }

  db.qrs.splice(index, 1);

  // Decrement user's qr count
  const user = db.users.find((u) => u.id === item.userId || u.email.toLowerCase() === item.userEmail.toLowerCase());
  if (user && user.qrCount > 0) {
    user.qrCount -= 1;
  }

  writeDb(db);
  return true;
}

export function getPlatformStats(): PlatformStats {
  const db = ensureDbFile();
  const today = new Date().toISOString().split('T')[0];

  const todayLogins = db.users.filter((u) => u.lastLoginAt?.startsWith(today)).length;

  return {
    totalUsers: db.users.length,
    totalQRs: db.qrs.length,
    totalAudioQRs: db.qrs.filter((q) => q.type === 'mp3').length,
    totalImageQRs: db.qrs.filter((q) => q.type === 'image').length,
    totalLinkQRs: db.qrs.filter((q) => q.type === 'url').length,
    totalTextQRs: db.qrs.filter((q) => q.type === 'text').length,
    todayLogins,
  };
}

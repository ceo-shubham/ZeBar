export type UserRole = 'USER' | 'VIP_OWNER';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  firstLoginAt: string;
  lastLoginAt: string;
  qrCount: number;
}

export type QRType = 'text' | 'url' | 'mp3' | 'image';

export interface QRSettings {
  fgColor: string;
  bgColor: string;
  eccLevel: 'L' | 'M' | 'Q' | 'H';
  size: number;
  dotStyle?: 'square' | 'rounded';
}

export interface QRCodeItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: QRType;
  title: string;
  content: string; // raw text, target URL, or view URL
  fileUrl?: string; // Backblaze B2 / local upload URL for MP3 or Image
  fileName?: string;
  fileSize?: number;
  logoUrl?: string; // Center logo URL or base64
  qrDataUrl: string; // Base64 PNG of rendered QR code
  settings: QRSettings;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalQRs: number;
  totalAudioQRs: number;
  totalImageQRs: number;
  totalLinkQRs: number;
  totalTextQRs: number;
  todayLogins: number;
}

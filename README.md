# ZeBar - Dynamic & Media QR Studio 🚀
### A Proud Product of **ZENSTRO** (`zenstro.space`)
**Founder & CEO:** Shubham Pathak (<ceo.shubhampathak@gmail.com>)  
**Live Target Domain:** `https://zebar.zenstro.space`

---

## 🌟 Overview
**ZeBar** is a high-performance, ad-free QR code generation and hosting platform. It empowers users to turn **Text**, **Web Links**, **MP3 Audio Files**, and **Images** into custom QR codes embedded with their custom company logo in the center.

### 🔑 Key Features
- 🔤 **Typographic Branding**: Modern minimalist typography with zero unnecessary clutter.
- 🎵 **MP3 Audio QR Codes**: Upload voice recordings, music tracks, or audio guides (up to 50MB) and let scanners listen via an integrated streaming audio player with waveform visualizer.
- 🖼️ **Image QR Codes**: Upload menus, posters, or photos (up to 25MB) with high-res mobile lightbox viewer.
- ✨ **Custom Center Brand Logo**: Embed any company or brand logo in the center with automatic **30% Error Correction (Level H)** for 100% scan reliability.
- 🚫 **100% Ad-Free**: Clean, blazing-fast experience for both creators and scanners.
- 👑 **VIP Executive Control Panel (`/vip`)**:
  - Exclusive access for **Shubham Pathak** (`ceo.shubhampathak@gmail.com`).
  - First-time user registration audit log (shows exact timestamp when users first sign in).
  - Search bar to search users by email and inspect their full QR generation history.
  - Global platform analytics & storage breakdown.
- 🛡️ **Safety & Compliance Terms (`/terms`)**:
  - Mandated legal disclosure stating all QR creation logs and files are retained for anti-abuse and security safety.
- ☁️ **Backblaze B2 Cloud Storage**: Native S3-compatible integration for high-durability media hosting.

---

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Lucide React
- **QR Engine:** `qrcode` with custom HTML5 Canvas logo compositing & SVG export
- **Auth:** Google OAuth 2.0 with JWT HTTP-only cookie sessions (`jose`)
- **Storage:** Backblaze B2 (AWS S3 Client v3) with local disk fallback
- **Database:** Atomic persistent JSON store (`data/zebar.json`)

---

## ⚙️ Environment Variables Setup (`.env.local`)

Copy `.env.example` to `.env.local`:

```bash
# App URL
NEXT_PUBLIC_APP_URL=https://zebar.zenstro.space

# JWT Session Secret
JWT_SECRET=your-random-secure-secret-here

# Google OAuth 2.0 (From Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Backblaze B2 Storage (From Backblaze B2 Console)
B2_KEY_ID=your-key-id
B2_APPLICATION_KEY=your-application-key
B2_BUCKET_NAME=your-bucket-name
B2_ENDPOINT=https://s3.us-west-004.backblazeb2.com
B2_REGION=us-west-004
B2_PUBLIC_URL_PREFIX=

# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=3c62fd7b101cb45266bcca6237c80f58
CLOUDFLARE_ZONE_ID=9e4580d684885d898daabd4355f00432
```

---

## 🔐 Google OAuth Configuration Guide
When creating your Google OAuth 2.0 credentials in Google Cloud Console:
1. **Authorized JavaScript origins:**
   - `https://zebar.zenstro.space`
   - `http://localhost:3000` (for local development)
2. **Authorized redirect URIs:**
   - `https://zebar.zenstro.space/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google`

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Build for production
npm run build
npm run start
```

Visit `http://localhost:3000`.

---

## 👑 VIP Panel Access
Sign in with `ceo.shubhampathak@gmail.com` to access the VIP Executive Control Panel at `/vip`.
Features:
- View all registered users and their first login timestamps.
- Search users by email.
- Inspect full QR code creation history for any user.

---

## 📄 License & Ownership
Copyright © 2026 **ZENSTRO**. Directed and founded by **Shubham Pathak**. All rights reserved.
Website: [zenstro.space](https://zenstro.space)

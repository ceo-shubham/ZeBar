'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ZeBarLogo from '@/components/ZeBarLogo';
import QRGenerator from '@/components/QRGenerator';
import { User } from '@/types';
import {
  Sparkles,
  Music,
  Image as ImageIcon,
  Link as LinkIcon,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers,
  Crown,
} from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="space-y-24 py-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Subtle neon ambient lights */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-indigo-600/20 blur-[120px] pointer-events-none rounded-full"></div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            {/* Zenstro Parent Company Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium bg-slate-900 border border-slate-800 text-slate-300 shadow-sm hover:border-cyan-500/40 transition-colors">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>An Official Product of</span>
              <a
                href="https://zenstro.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                ZENSTRO <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Dir. Shubham Pathak</span>
            </div>

            {/* Main Typographic Headline */}
            <div className="pt-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                High-Impact QR Codes for{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Audio, Images & Links
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Generate interactive QR codes from <strong className="text-slate-200">Text</strong>, <strong className="text-slate-200">MP3 Audio</strong>, <strong className="text-slate-200">Images</strong>, and <strong className="text-slate-200">Web Links</strong> with your custom brand logo embedded in the center. Completely ad-free.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={user ? '/dashboard' : '/login'}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>{user ? 'Open QR Studio' : 'Sign in with Google to Start'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/terms"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition-all hover:border-slate-700"
              >
                Safety & Legal Terms
              </Link>

              {user?.role === 'VIP_OWNER' && (
                <Link
                  href="/vip"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>VIP Control Panel</span>
                </Link>
              )}
            </div>

            {/* Quick Feature Tickers */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Ads</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Music className="w-4 h-4 text-purple-400" />
                <span>MP3 Audio Hosting</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Custom Center Logo</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Secure Safety Logs</span>
              </div>
            </div>
          </div>
        </section>

        {/* Live Interactive Generator Studio */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400">
              Try It Live Right Here
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Test the ZeBar QR Code Engine
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl mx-auto">
              Experiment with colors, upload your brand logo, and scan in real-time. Sign in to save, track scan analytics, and host cloud files!
            </p>
          </div>

          <QRGenerator user={user} />
        </section>

        {/* Key Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400">
              Engineered for Creators & Brands
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Why Professionals Choose ZeBar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">MP3 & Audio QR Codes</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload podcasts, music tracks, voice notes, or museum audio guides up to 50MB. Scanners get an instant, elegant player with waveform visualization.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Custom Center Brand Logos</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Seamlessly place your business logo in the center of the QR code. Automatic 30% error correction guarantees 100% scan reliability on every camera.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">High-Res Image Hosting</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Share menus, flyers, portfolios, and infographics directly via QR. Viewers enjoy a fast, distraction-free lightbox viewer on their mobile device.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/50 border border-amber-800/40 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Zero Ads & Anti-Spam</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                No third-party advertisements, no interstitial popups, and no intrusive tracking. Pure, lightning-fast destination resolution.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-950/50 border border-blue-800/40 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">PNG & Vector SVG Exports</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Export in ultra-sharp 1024x1024 PNG for digital displays or infinite-scale vector SVG format for printing on billboards, packaging, and business cards.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/50 border border-rose-800/40 flex items-center justify-center text-rose-400 mb-5 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Safety Audit History</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                All QR generation history is securely logged to guarantee safety, anti-abuse compliance, and accountability under ZENSTRO platform standards.
              </p>
            </div>
          </div>
        </section>

        {/* Company Showcase & Founder Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
                <span>ZENSTRO ECOSYSTEM</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Powered by ZENSTRO & Shubham Pathak
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                ZeBar is proudly built and maintained under the technological umbrella of <strong className="text-slate-200">ZENSTRO</strong>. Designed with uncompromising standards for security, speed, and design elegance.
              </p>
              <div className="pt-2">
                <a
                  href="https://zenstro.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all hover:scale-105"
                >
                  <span>Explore ZENSTRO Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center shrink-0 w-full md:w-80 space-y-3">
              <ZeBarLogo size="md" />
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-xs font-bold text-slate-200">Executive Leadership</p>
                <p className="text-sm text-cyan-400 font-semibold mt-0.5">Shubham Pathak</p>
                <p className="text-[11px] text-slate-500 font-mono">CEO, ZENSTRO</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">ceo.shubhampathak@gmail.com</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import ZeBarLogo from './ZeBarLogo';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <ZeBarLogo size="md" />
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              ZeBar is the high-performance media & dynamic QR code generation platform.
              Craft interactive QR codes from Text, MP3 audio, Images, and Web links with custom brand logos and zero ads.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>Parent Company:</span>
              <a
                href="https://zenstro.space"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
              >
                ZENSTRO <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <span>Founder: Shubham Pathak</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4 font-mono">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  QR Studio & Generator
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-cyan-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a
                  href="https://zenstro.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  ZENSTRO Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Safety Notice Callout */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Safety Compliance</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                For platform security and safety compliance, user QR code history is securely retained to prevent abuse and protect users.
              </p>
            </div>
            <Link
              href="/terms"
              className="mt-3 text-xs text-cyan-400 hover:underline font-medium inline-block"
            >
              Read full safety terms →
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 ZeBar. All rights reserved. A proud product of <a href="https://zenstro.space" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white underline">ZENSTRO</a>.</p>
          <div className="flex items-center gap-1">
            <span>Directed by Shubham Pathak</span>
            <span>•</span>
            <span className="flex items-center gap-1">Built with precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

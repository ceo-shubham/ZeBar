import React from 'react';
import Link from 'next/link';

interface ZeBarLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export default function ZeBarLogo({ size = 'md', showTagline = true, className = '' }: ZeBarLogoProps) {
  const fontSizes = {
    sm: 'text-xl tracking-tight',
    md: 'text-2xl md:text-3xl tracking-tight',
    lg: 'text-4xl md:text-5xl tracking-tighter',
    xl: 'text-5xl md:text-6xl tracking-tighter font-black',
  };

  const badgeSizes = {
    sm: 'text-[9px] px-1.5 py-0.5',
    md: 'text-[10px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-sm px-3 py-1',
  };

  return (
    <Link href="/" className={`group inline-flex flex-col select-none transition-transform active:scale-95 ${className}`}>
      <div className="flex items-center gap-1.5">
        {/* Typographic Logo Mark */}
        <div className="flex items-baseline font-extrabold font-mono">
          <span className={`${fontSizes[size]} bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent group-hover:brightness-110 transition-all`}>
            Ze
          </span>
          <span className={`${fontSizes[size]} text-slate-100 group-hover:text-white transition-colors`}>
            Bar
          </span>
        </div>

        {/* Futuristic QR Dot Accent Pill */}
        <div className="flex items-center gap-0.5 bg-slate-800/90 border border-cyan-500/30 rounded px-1.5 py-0.5 shadow-sm shadow-cyan-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-[10px] font-mono font-semibold text-cyan-300">QR</span>
        </div>
      </div>

      {/* Sub-Brand Tagline */}
      {showTagline && (
        <div className="flex items-center gap-1 mt-0.5">
          <span className={`font-mono text-slate-400 font-medium ${badgeSizes[size]}`}>
            by <span className="text-cyan-400 hover:underline">ZENSTRO</span>
          </span>
        </div>
      )}
    </Link>
  );
}

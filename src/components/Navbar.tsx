'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ZeBarLogo from './ZeBarLogo';
import { User } from '@/types';
import { Crown, QrCode, FileText, Globe, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <ZeBarLogo size="md" />
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/dashboard'
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>QR Studio</span>
              </Link>

              <Link
                href="/terms"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/terms'
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Terms & Safety</span>
              </Link>

              <a
                href="https://zenstro.space"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-all border border-transparent hover:border-slate-800"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-500" />
                <span>zenstro.space</span>
              </a>
            </div>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {/* VIP Owner Link if CEO is logged in */}
            {user?.role === 'VIP_OWNER' && (
              <Link
                href="/vip"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  pathname === '/vip'
                    ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                    : 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>VIP Panel</span>
              </Link>
            )}

            {!loading && user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2">
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-cyan-500/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : !loading ? (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

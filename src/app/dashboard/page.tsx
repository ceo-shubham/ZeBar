'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRGenerator from '@/components/QRGenerator';
import QRCard from '@/components/QRCard';
import { User, QRCodeItem } from '@/types';
import {
  QrCode,
  History,
  PlusCircle,
  Eye,
  Crown,
  Search,
  Filter,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [qrs, setQrs] = useState<QRCodeItem[]>([]);
  const [loadingQrs, setLoadingQrs] = useState(true);
  const [activeView, setActiveView] = useState<'create' | 'history'>('create');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);
    } catch {
      //
    } finally {
      setLoadingUser(false);
    }
  };

  const loadQrs = async () => {
    setLoadingQrs(true);
    try {
      const res = await fetch('/api/qr');
      if (res.ok) {
        const data = await res.json();
        setQrs(data.qrs || []);
      }
    } catch {
      //
    } finally {
      setLoadingQrs(false);
    }
  };

  useEffect(() => {
    loadUserData();
    loadQrs();
  }, []);

  const totalScans = qrs.reduce((acc, curr) => acc + (curr.scanCount || 0), 0);

  const filteredQrs = qrs.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* User Greeting & Stats Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-cyan-500/20 shrink-0">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover"
                />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  Welcome, {user?.name || 'Creator'}
                </h1>
                {user?.role === 'VIP_OWNER' && (
                  <Link
                    href="/vip"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>VIP OWNER</span>
                  </Link>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {user?.email} • Account Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-3 text-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase">My QRs</span>
              <p className="text-xl font-extrabold text-white mt-0.5">{qrs.length}</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-5 py-3 text-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Total Scans</span>
              <p className="text-xl font-extrabold text-cyan-400 mt-0.5 flex items-center justify-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{totalScans}</span>
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('create')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'create'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New QR</span>
            </button>

            <button
              onClick={() => setActiveView('history')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'history'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>My History ({qrs.length})</span>
            </button>
          </div>

          {activeView === 'history' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Filter your QRs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 pl-9 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
              >
                <option value="all">All Types</option>
                <option value="url">Web Links</option>
                <option value="mp3">Audio (MP3)</option>
                <option value="image">Images</option>
                <option value="text">Plain Text</option>
              </select>
            </div>
          )}
        </div>

        {/* View 1: QR Generator Studio */}
        {activeView === 'create' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">QR Code Creation Studio</h2>
            </div>
            <QRGenerator
              user={user}
              onSuccess={() => {
                loadQrs();
                setActiveView('history');
              }}
            />
          </div>
        )}

        {/* View 2: User's QR History */}
        {activeView === 'history' && (
          <div className="space-y-6">
            {loadingQrs ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                <p className="text-xs font-mono">Loading your saved QR codes...</p>
              </div>
            ) : filteredQrs.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200">No QR codes found</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchQuery || filterType !== 'all'
                      ? 'No items match your active filters.'
                      : 'You haven’t created any QR codes yet.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setActiveView('create');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Create Your First QR Code
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQrs.map((item) => (
                  <QRCard
                    key={item.id}
                    item={item}
                    onDelete={(deletedId) => {
                      setQrs((prev) => prev.filter((q) => q.id !== deletedId));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

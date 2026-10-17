'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRCard from '@/components/QRCard';
import { User, QRCodeItem, PlatformStats } from '@/types';
import {
  Crown,
  Search,
  Users,
  QrCode,
  Music,
  Image as ImageIcon,
  Link as LinkIcon,
  ShieldAlert,
  Calendar,
  History,
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function VipPanelPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // VIP data
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // User inspection modal / state
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [inspectingHistory, setInspectingHistory] = useState<QRCodeItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Check auth
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.user);
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  const loadVipData = async (query = '') => {
    setLoadingUsers(true);
    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // 2. Fetch Users
      const url = query ? `/api/admin/users?q=${encodeURIComponent(query)}` : '/api/admin/users';
      const usersRes = await fetch(url);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }
    } catch (err) {
      console.error('Failed to load VIP data:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'VIP_OWNER') {
      loadVipData();
    }
  }, [currentUser]);

  // Handle Inspect History for a specific user
  const handleInspectUser = async (userToInspect: User) => {
    setInspectingUser(userToInspect);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/users?inspect=${encodeURIComponent(userToInspect.email)}`);
      if (res.ok) {
        const data = await res.json();
        setInspectingHistory(data.inspectedHistory || []);
      }
    } catch (err) {
      console.error('Failed to load user history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadVipData(searchQuery);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  // Restrict access if not owner
  if (currentUser?.role !== 'VIP_OWNER') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-lg mx-auto my-auto px-4 text-center">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-full w-20 h-20 mx-auto flex items-center justify-center text-amber-400 mb-6">
            <Crown className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-white">VIP Executive Panel Restricted</h1>
          <p className="text-sm text-slate-400 mt-2">
            This dashboard is exclusively reserved for the CEO & Founder of ZENSTRO,{' '}
            <strong className="text-amber-300">Shubham Pathak</strong> (<span className="font-mono text-cyan-300">ceo.shubhampathak@gmail.com</span>).
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
            >
              Sign in with Owner Account
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
            >
              Back to User Studio
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* VIP Executive Hero Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 mb-3">
                <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>EXECUTIVE VIP PORTAL • ZENSTRO LEADERSHIP</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Welcome, Shubham Pathak
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Real-time supervisory control of ZeBar. Track first-time registrations, search user email histories, inspect encoded files, and monitor platform security.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => loadVipData(searchQuery)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh Live Data</span>
              </button>

              <a
                href="https://zenstro.space"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
              >
                <span>zenstro.space</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Global Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono">Total Users</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
              <span className="text-[10px] text-cyan-400">Registered</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono">Total QRs</span>
                <QrCode className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-white">{stats.totalQRs}</p>
              <span className="text-[10px] text-indigo-400">All-time generated</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono">MP3 QRs</span>
                <Music className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-black text-white">{stats.totalAudioQRs}</p>
              <span className="text-[10px] text-purple-400">Hosted audios</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono">Image QRs</span>
                <ImageIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{stats.totalImageQRs}</p>
              <span className="text-[10px] text-emerald-400">Hosted images</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono">Link & Text</span>
                <LinkIcon className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">{stats.totalLinkQRs + stats.totalTextQRs}</p>
              <span className="text-[10px] text-amber-400">Direct codes</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono">Today Logins</span>
                <Calendar className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-white">{stats.todayLogins}</p>
              <span className="text-[10px] text-rose-400">Active today</span>
            </div>
          </div>
        )}

        {/* User Search Bar & First Time Logins Feed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>User Registry & First-Time Login Audit</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Chronological list of all users who have signed in for the first time.
              </p>
            </div>

            {/* Email Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative sm:w-80">
              <input
                type="text"
                placeholder="Search by email address or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </form>
          </div>

          {/* Table of Users */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">First-Time Login</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4 text-center">QRs Created</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const isOwner = u.email.toLowerCase() === 'ceo.shubhampathak@gmail.com';
                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold shrink-0">
                              {u.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                u.name?.charAt(0) || 'U'
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                                {u.name}
                                {isOwner && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    OWNER
                                  </span>
                                )}
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {u.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {u.email}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-cyan-300">
                          {new Date(u.firstLoginAt).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {new Date(u.lastLoginAt).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                          {u.qrCount || 0}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleInspectUser(u)}
                            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Check History</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User History Inspection Modal / Panel */}
        {inspectingUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Audit Inspector
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      QR Creation History: {inspectingUser.email}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    User: {inspectingUser.name} • First Logged In: {new Date(inspectingUser.firstLoginAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => setInspectingUser(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {loadingHistory ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
                    <p className="text-xs font-mono">Retrieving secure logs...</p>
                  </div>
                ) : inspectingHistory.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-mono text-sm">
                    This user has not generated any QR codes yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inspectingHistory.map((qr) => (
                      <QRCard
                        key={qr.id}
                        item={qr}
                        canDelete={true}
                        onDelete={(deletedId) => {
                          setInspectingHistory((prev) => prev.filter((item) => item.id !== deletedId));
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Audit records saved for safety compliance</span>
                </span>
                <button
                  onClick={() => setInspectingUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Close Audit
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

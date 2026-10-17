'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ZeBarLogo from '@/components/ZeBarLogo';
import { Crown, Sparkles, Shield, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [hasGoogleAuth, setHasGoogleAuth] = useState(false);
  const [googleAuthUrl, setGoogleAuthUrl] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam || '');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setHasGoogleAuth(data.hasGoogleAuth);
        if (data.user) {
          if (data.user.role === 'VIP_OWNER') {
            router.push('/vip');
          } else {
            router.push('/dashboard');
          }
        }
      });

    // Check Google Auth URL
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_google_url' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) setGoogleAuthUrl(data.url);
      })
      .catch(() => {});
  }, [router]);

  const handleDevLogin = async (email: string, name: string) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.user.role === 'VIP_OWNER') {
        router.push('/vip');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-4">
          <ZeBarLogo size="lg" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
          Welcome to ZeBar
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to generate, host MP3/Images, and manage your custom QR codes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Option: Google OAuth */}
          {hasGoogleAuth && googleAuthUrl ? (
            <div>
              <a
                href={googleAuthUrl}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950/80 border border-cyan-800/40 rounded-2xl text-left">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Google OAuth Status: Ready for Production Credentials</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Once your application is live on <span className="text-cyan-300 font-mono">zebar.zenstro.space</span>, add your Google Cloud OAuth Client ID & Secret in settings.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                  Callback URL: <span className="text-slate-300">https://zebar.zenstro.space/api/auth/callback/google</span>
                </div>
              </div>

              {/* Instant One-Click Login for CEO Shubham Pathak */}
              <button
                type="button"
                onClick={() => handleDevLogin('ceo.shubhampathak@gmail.com', 'Shubham Pathak')}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Crown className="w-4 h-4 text-slate-950" />
                <span>Sign In as CEO (Shubham Pathak - VIP Owner)</span>
              </button>

              {/* Instant One-Click Login for Demo User */}
              <button
                type="button"
                onClick={() => handleDevLogin('alex.creator@zenstro.space', 'Alex Creator')}
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In as Test User (Alex Creator)</span>
              </button>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-slate-900 px-3 text-slate-500">Or sign in with any email</span>
            </div>
          </div>

          {/* Custom Email Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customEmail) handleDevLogin(customEmail, customName);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="John Doe"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !customEmail}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Safety disclaimer */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              By signing in, you agree to ZeBar&apos;s{' '}
              <a href="/terms" className="text-cyan-400 hover:underline">
                Terms & Conditions
              </a>
              . Your QR creation history is retained for safety compliance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginContent />
    </Suspense>
  );
}

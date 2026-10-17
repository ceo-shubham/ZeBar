'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ZeBarLogo from '@/components/ZeBarLogo';
import { QRCodeItem } from '@/types';
import {
  Play,
  Pause,
  Download,
  ExternalLink,
  Music,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
  Loader2,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function MediaViewerClient() {
  const params = useParams();
  const id = params?.id as string;

  const [qr, setQr] = useState<QRCodeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/qr/${id}?public=1`)
      .then((res) => {
        if (!res.ok) throw new Error('Content not found or expired');
        return res.json();
      })
      .then((data) => {
        setQr(data.qr);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = Number(e.target.value);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
        <p className="text-sm font-mono">Loading media from ZeBar Cloud...</p>
      </div>
    );
  }

  if (error || !qr) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center px-4">
        <ZeBarLogo size="md" className="mb-6" />
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-100">Content Not Available</h2>
          <p className="text-sm text-slate-400 mt-2">
            The media QR code you scanned could not be retrieved or has been removed.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
          >
            Visit ZeBar Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <ZeBarLogo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Secure QR Destination
            </span>
            <Link
              href="/"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400"
            >
              Create Free QR
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-12 w-full">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-950/70 border border-cyan-800/40 text-cyan-400 mb-3">
              {qr.type === 'mp3' ? <Music className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
              <span className="uppercase">{qr.type} Media Experience</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {qr.title}
            </h1>
            <div className="flex items-center justify-center gap-3 text-xs text-slate-400 mt-2 font-mono">
              <span>Created by {qr.userName || 'Verified Creator'}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Eye className="w-3 h-3" />
                <span>{qr.scanCount} scans</span>
              </span>
            </div>
          </div>

          {qr.type === 'mp3' && qr.fileUrl && (
            <div className="space-y-6">
              <audio
                ref={audioRef}
                src={qr.fileUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />

              <div className="h-28 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-center gap-1 px-4 overflow-hidden relative">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-300 ${
                      isPlaying
                        ? 'bg-gradient-to-t from-cyan-500 to-indigo-500 animate-pulse'
                        : 'bg-slate-800'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(16, (i * 7) % 80 + 10)}px` : '20px',
                      animationDelay: `${(i % 5) * 120}ms`,
                    }}
                  />
                ))}
              </div>

              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-white" />
                  ) : (
                    <Play className="w-7 h-7 fill-white ml-0.5" />
                  )}
                </button>

                <a
                  href={qr.fileUrl}
                  download={qr.fileName || 'audio.mp3'}
                  className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-cyan-400 transition-colors"
                  title="Download Audio"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}

          {qr.type === 'image' && qr.fileUrl && (
            <div className="space-y-6 flex flex-col items-center">
              <div className="w-full max-h-[500px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.fileUrl}
                  alt={qr.title}
                  className="max-h-[480px] w-auto object-contain rounded-xl"
                />
              </div>

              <a
                href={qr.fileUrl}
                download={qr.fileName || 'image.png'}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Resolution Image</span>
              </a>
            </div>
          )}

          {qr.type === 'url' && (
            <div className="text-center space-y-4 py-4">
              <p className="text-sm text-slate-300 font-mono break-all">{qr.content}</p>
              <a
                href={qr.content}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm"
              >
                <span>Visit Destination Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {qr.type === 'text' && (
            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-left">
              <p className="text-xs uppercase font-mono text-slate-500 mb-2">Message Content</p>
              <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{qr.content}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified & Scanned by ZeBar</span>
            </div>
            <a
              href="https://zenstro.space"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              A Zenstro Platform
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Hosted securely on ZeBar • Direct company contact: <span className="text-cyan-400 font-mono">ceo.shubhampathak@gmail.com</span></p>
      </footer>
    </div>
  );
}

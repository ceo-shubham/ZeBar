'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QRCodeItem } from '@/types';
import {
  Download,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Eye,
  Music,
  Image as ImageIcon,
  Link as LinkIcon,
  Type,
} from 'lucide-react';

interface QRCardProps {
  item: QRCodeItem;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export default function QRCard({ item, onDelete, canDelete = true }: QRCardProps) {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `${item.title.replace(/\s+/g, '_')}_QR.png`;
    link.href = item.qrDataUrl;
    link.click();
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this QR code?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/qr/${item.id}`, { method: 'DELETE' });
      if (res.ok && onDelete) {
        onDelete(item.id);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'mp3':
        return <Music className="w-3.5 h-3.5 text-purple-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'url':
        return <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />;
      case 'text':
      default:
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getTypeBadge = () => {
    const styles = {
      mp3: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
      image: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
      url: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50',
      text: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
    };
    return styles[item.type] || styles.text;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:shadow-cyan-500/5 group">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getTypeBadge()}`}
          >
            {getTypeIcon()}
            <span className="uppercase tracking-wider font-mono">{item.type}</span>
          </span>

          <span className="text-[11px] text-slate-500 font-mono">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* QR Image & Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.qrDataUrl}
              alt={item.title}
              className="w-20 h-20 object-contain rounded"
            />
          </div>

          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono truncate mt-0.5" title={item.content}>
              {item.content}
            </p>
            {item.fileName && (
              <p className="text-[10px] text-slate-500 truncate mt-1">
                File: {item.fileName} {item.fileSize ? `(${(item.fileSize / 1024 / 1024).toFixed(1)}MB)` : ''}
              </p>
            )}
            <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono mt-1.5">
              <Eye className="w-3 h-3" />
              <span>{item.scanCount || 0} scans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            title="Download PNG"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyLink}
            title="Copy target link"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-cyan-400 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {(item.type === 'mp3' || item.type === 'image') && (
            <Link
              href={`/view/${item.id}`}
              target="_blank"
              title="Open viewer page"
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete QR"
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

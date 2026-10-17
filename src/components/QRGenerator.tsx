'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Type,
  Link as LinkIcon,
  Music,
  Image as ImageIcon,
  Upload,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  Loader2,
  Trash2,
} from 'lucide-react';
import { QRType, QRSettings, User } from '@/types';

interface QRGeneratorProps {
  user: User | null;
  onSuccess?: () => void;
  initialType?: QRType;
}

export default function QRGenerator({ user, onSuccess, initialType = 'url' }: QRGeneratorProps) {
  const [activeTab, setActiveTab] = useState<QRType>(initialType);
  const [title, setTitle] = useState('');
  
  // Content states
  const [textContent, setTextContent] = useState('Hello from ZeBar!');
  const [urlContent, setUrlContent] = useState('https://zenstro.space');
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    filename: string;
    fileSize: number;
    mimeType: string;
  } | null>(null);

  // Logo & Styling states
  const [centerLogo, setCenterLogo] = useState<string | null>(null);
  const [centerLogoName, setCenterLogoName] = useState<string>('');
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [eccLevel, setEccLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');

  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine what raw text/URL goes into the QR
  const getEncodedTarget = (): string => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zebar.zenstro.space';
    if (activeTab === 'text') {
      return textContent || 'ZeBar';
    }
    if (activeTab === 'url') {
      return urlContent || 'https://zenstro.space';
    }
    if (activeTab === 'mp3' || activeTab === 'image') {
      if (uploadedFile?.url) {
        // Points to public viewer
        if (uploadedFile.url.startsWith('http')) {
          return uploadedFile.url;
        }
        return `${origin}${uploadedFile.url}`;
      }
      return `${origin}/view/demo`;
    }
    return 'https://zenstro.space';
  };

  // Re-render QR code on canvas whenever inputs change
  useEffect(() => {
    const renderQR = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const targetText = getEncodedTarget();
      const currentEcc = centerLogo ? 'H' : eccLevel;

      try {
        // Render base QR code to canvas
        await QRCode.toCanvas(canvas, targetText, {
          width: 400,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: currentEcc,
        });

        // If user uploaded a center logo, draw it in the center
        if (centerLogo) {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.src = centerLogo;

          logoImg.onload = () => {
            const canvasWidth = canvas.width;
            const logoSize = canvasWidth * 0.22; // 22% of QR size
            const logoX = (canvasWidth - logoSize) / 2;
            const logoY = (canvasWidth - logoSize) / 2;

            // Draw white background shield for logo
            const padding = 8;
            ctx.fillStyle = bgColor === 'transparent' ? '#ffffff' : bgColor;
            ctx.beginPath();
            ctx.roundRect(
              logoX - padding,
              logoY - padding,
              logoSize + padding * 2,
              logoSize + padding * 2,
              12
            );
            ctx.fill();

            // Draw border around logo shield
            ctx.strokeStyle = fgColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw logo image
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(logoX, logoY, logoSize, logoSize, 8);
            ctx.clip();
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            ctx.restore();
          };
        }
      } catch (err) {
        console.error('Canvas render error:', err);
      }
    };

    renderQR();
  }, [activeTab, textContent, urlContent, uploadedFile, centerLogo, fgColor, bgColor, eccLevel]);

  // Handle media file upload (MP3 or Image)
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      setErrorMsg('Please sign in to upload files and generate media QR codes.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadedFile({
        url: data.url,
        filename: data.filename,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      });

      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle center logo upload
  const handleCenterLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file for the center logo.');
      return;
    }

    setCenterLogoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCenterLogo(event.target?.result as string);
      setEccLevel('H'); // Boost error correction for logo readability
    };
    reader.readAsDataURL(file);
  };

  // Download high-resolution PNG
  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${title || 'ZeBar-QR'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Download SVG
  const handleDownloadSVG = async () => {
    const targetText = getEncodedTarget();
    try {
      const svgString = await QRCode.toString(targetText, {
        type: 'svg',
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: centerLogo ? 'H' : eccLevel,
        margin: 2,
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${title || 'ZeBar-QR'}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG download failed:', err);
    }
  };

  // Copy Image to clipboard
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch (err) {
      console.error('Copy failed:', err);
      setErrorMsg('Failed to copy image to clipboard.');
    }
  };

  // Save to Dashboard History
  const handleSaveQR = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please provide a title for your QR code.');
      return;
    }

    if ((activeTab === 'mp3' || activeTab === 'image') && !uploadedFile) {
      setErrorMsg(`Please upload a ${activeTab.toUpperCase()} file first.`);
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const canvas = canvasRef.current;
      const clientGeneratedQrDataUrl = canvas?.toDataURL('image/png') || '';

      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          title: title.trim(),
          content: activeTab === 'url' ? urlContent : activeTab === 'text' ? textContent : uploadedFile?.url,
          fileUrl: uploadedFile?.url,
          fileName: uploadedFile?.filename,
          fileSize: uploadedFile?.fileSize,
          logoUrl: centerLogo,
          settings: { fgColor, bgColor, eccLevel: centerLogo ? 'H' : eccLevel, size: 512 },
          clientGeneratedQrDataUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save QR code');
      }

      setSuccessMsg('QR code saved successfully to your dashboard!');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 lg:p-8">
      {/* Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'url'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Web Link</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'text'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Plain Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mp3')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'mp3'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>MP3 Audio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'image'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image File</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Inputs & Customization */}
        <div className="lg:col-span-7 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 font-mono">
              QR Code Title / Campaign Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Summer Event Audio Guide / Company Portfolio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm transition-all"
            />
          </div>

          {/* Tab 1: Web Link */}
          {activeTab === 'url' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 font-mono">
                Destination Website URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={urlContent}
                  onChange={(e) => setUrlContent(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm transition-all"
                />
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          {/* Tab 2: Plain Text */}
          {activeTab === 'text' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 font-mono">
                Message / Text Content *
              </label>
              <textarea
                rows={4}
                placeholder="Enter instructions, secret code, Wi-Fi password, or notes..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-sm transition-all"
              />
            </div>
          )}

          {/* Tab 3: MP3 Audio */}
          {activeTab === 'mp3' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 font-mono">
                Upload MP3 Audio File (Max 50MB) *
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/50 rounded-2xl p-6 text-center transition-all">
                <input
                  type="file"
                  id="mp3-input"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/aac,audio/m4a"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <label htmlFor="mp3-input" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-3">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Music className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-200">
                    {isUploading ? 'Uploading to Storage...' : 'Click to select audio file'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">MP3, WAV, AAC, M4A up to 50MB</span>
                </label>

                {uploadedFile && (
                  <div className="mt-4 p-3 bg-slate-900 border border-cyan-800/40 rounded-xl flex items-center justify-between text-left">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Music className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-200 truncate">{uploadedFile.filename}</p>
                        <p className="text-[10px] text-slate-500">{(uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Image */}
          {activeTab === 'image' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 font-mono">
                Upload Image File (Max 25MB) *
              </label>
              <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/50 rounded-2xl p-6 text-center transition-all">
                <input
                  type="file"
                  id="image-input"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <label htmlFor="image-input" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-3">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-200">
                    {isUploading ? 'Uploading to Storage...' : 'Click to select image file'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 25MB</span>
                </label>

                {uploadedFile && (
                  <div className="mt-4 p-3 bg-slate-900 border border-cyan-800/40 rounded-xl flex items-center justify-between text-left">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-200 truncate">{uploadedFile.filename}</p>
                        <p className="text-[10px] text-slate-500">{(uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Center Logo Section */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Center Brand Logo (Customizable)</span>
              </label>
              {centerLogo && (
                <button
                  type="button"
                  onClick={() => {
                    setCenterLogo(null);
                    setCenterLogoName('');
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove Logo
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Upload your company or brand logo. It will be seamlessly centered with automatic error recovery!
            </p>

            <div className="flex items-center gap-3">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleCenterLogoUpload}
                className="hidden"
              />
              <label
                htmlFor="logo-upload"
                className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-cyan-500 bg-slate-950 text-slate-200 text-xs font-semibold cursor-pointer inline-flex items-center gap-2 transition-all hover:bg-slate-900"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>{centerLogo ? 'Replace Logo' : 'Upload Center Logo'}</span>
              </label>
              {centerLogoName && (
                <span className="text-xs text-cyan-300 font-mono truncate max-w-[200px]">
                  {centerLogoName}
                </span>
              )}
            </div>
          </div>

          {/* Color Customization */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Pattern Color
              </label>
              <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-24 bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                Background Color
              </label>
              <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-24 bg-transparent text-xs font-mono text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: Live QR Preview & Actions */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-slate-950/90 border border-slate-800/90 rounded-2xl p-6 flex flex-col items-center shadow-xl">
            <div className="text-center mb-4">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40">
                Live Interactive QR Preview
              </span>
              <p className="text-xs text-slate-500 mt-1">Scan directly with your phone camera</p>
            </div>

            {/* Canvas Container */}
            <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-slate-800 flex items-center justify-center">
              <canvas ref={canvasRef} className="max-w-[260px] sm:max-w-[300px] h-auto rounded-lg" />
            </div>

            {/* Target Display Preview */}
            <div className="w-full mt-4 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Encodes</p>
              <p className="text-xs text-slate-300 font-mono truncate max-w-[280px] mx-auto mt-0.5">
                {getEncodedTarget()}
              </p>
            </div>

            {/* Download & Action Buttons */}
            <div className="w-full grid grid-cols-3 gap-2 mt-4">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSVG}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>SVG</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Primary Save Button */}
            <div className="w-full mt-4">
              {user ? (
                <button
                  type="button"
                  onClick={handleSaveQR}
                  disabled={isSaving || isUploading}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Account...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Save QR to Dashboard</span>
                    </>
                  )}
                </button>
              ) : (
                <a
                  href="/login"
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 text-center"
                >
                  <span>Sign In with Google to Save</span>
                </a>
              )}
            </div>

            {/* Safety disclaimer note */}
            <p className="text-[10px] text-slate-500 text-center mt-3 leading-relaxed">
              * History & files are saved for security compliance and safety auditing. Zero ads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

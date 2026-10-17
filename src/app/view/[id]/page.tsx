import React, { Suspense } from 'react';
import MediaViewerClient from '@/components/MediaViewerClient';

export function generateStaticParams() {
  return [{ id: 'demo' }];
}

export default function MediaViewerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">Loading media...</div>}>
      <MediaViewerClient />
    </Suspense>
  );
}

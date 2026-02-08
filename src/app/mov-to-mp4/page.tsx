'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import VideoConverter with SSR disabled to prevent 'ffmpeg.wasm does not support nodejs' error
const VideoConverter = dynamic(
  () => import('@/components/VideoConverter'),
  { 
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center bg-page text-txt-secondary">
            Loading Converter...
        </div>
    )
  }
);

export default function MovToMp4Page() {
  return <VideoConverter />;
}

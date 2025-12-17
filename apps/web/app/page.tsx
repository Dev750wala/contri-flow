'use client';

import React from 'react';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {

  return (
    <div className="relative min-h-screen w-full overflow-hidden pt-8">
      {/* Video Background */}
      <div className="fixed inset-0 w-screen h-screen z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        >
          <source src="/HomeVideoBackground.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <LandingPage />
      </div>
    </div>
  );
}

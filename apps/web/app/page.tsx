'use client';

import React from 'react';
import { LandingPage } from '@/components/LandingPage';
import Navbar from '@/components/navbar';

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <LandingPage />
      </div>
    </div>
  );
}

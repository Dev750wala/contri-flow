'use client';

import React from 'react';
import { LandingPage } from '@/components/LandingPage';
import Navbar from '@/components/navbar';

export default function Home() {

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <LandingPage />
    </div>
  );
}

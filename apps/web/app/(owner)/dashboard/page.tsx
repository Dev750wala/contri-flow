'use client'

import { OwnerDashboard } from '@/components/OwnerDashboard';
import Navbar from '@/components/navbar';
import React from 'react';

interface User {
  id: string;
  username: string;
  avatar: string;
  type: 'owner' | 'contributor';
  walletConnected: boolean;
}

const DashboardPage = () => {
  const mockUser: User = {
    id: 'user_123456789',
    username: 'johndev',
    avatar: 'https://github.com/johndev.png',
    type: 'owner',
    walletConnected: true,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <div className="border-b bg-gradient-to-r from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Owner Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your organizations, repositories, and distribute rewards
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OwnerDashboard user={mockUser} />
      </div>
    </div>
  );
};

export default DashboardPage;

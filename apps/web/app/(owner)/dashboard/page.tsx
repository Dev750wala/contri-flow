'use client'

import { OwnerDashboard } from '@/components/OwnerDashboard';
import React from 'react';

interface User {
  id: string;
  username: string;
  avatar: string;
  type: 'owner' | 'contributor';
  walletConnected: boolean;
}

const page = () => {
  const mockUser: User = {
    id: 'user_123456789',
    username: 'johndev',
    avatar: 'https://github.com/johndev.png',
    type: 'owner',
    walletConnected: true,
  };

  return (
    <div>
      <OwnerDashboard user={mockUser} />
    </div>
  );
};

export default page;

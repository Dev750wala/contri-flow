'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingPage } from '@/components/LandingPage';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { ContributorDashboard } from '@/components/ContributorDashboard';
import { AuthModal } from '@/components/AuthModal';
import { Github, Wallet, Menu, LogOut } from 'lucide-react';

type UserType = 'owner' | 'contributor' | null;

interface User {
  id: string;
  username: string;
  avatar: string;
  type: UserType;
  walletConnected: boolean;
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'dashboard'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);

  const handleLogin = (userType: UserType) => {
    setSelectedUserType(userType);
    setShowAuthModal(true);
  };

  const handleAuthComplete = () => {
    // Mock user login
    const mockUser: User = {
      id: selectedUserType === 'owner' ? 'owner123' : 'contributor456',
      username: selectedUserType === 'owner' ? 'repo-owner' : 'awesome-contributor',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserType}`,
      type: selectedUserType,
      walletConnected: false
    };
    
    setUser(mockUser);
    setCurrentPage('dashboard');
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  const connectWallet = () => {
    if (user) {
      setUser({ ...user, walletConnected: true });
    }
  };

  if (currentPage === 'landing') {
    return (
      <>
        <LandingPage onLogin={handleLogin} />
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onComplete={handleAuthComplete}
          userType={selectedUserType}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 
                className="text-xl font-semibold cursor-pointer hover:text-primary/80"
                onClick={() => setCurrentPage('landing')}
              >
                ContriFlow
              </h1>
              <Badge variant="secondary">
                {user?.type === 'owner' ? 'Repository Owner' : 'Contributor'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {!user?.walletConnected ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={connectWallet}
                  className="flex items-center gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Wallet Connected</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <img 
                  src={user?.avatar} 
                  alt={user?.username}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">{user?.username}</span>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {user?.type === 'owner' ? (
          <OwnerDashboard user={user as User & { type: 'owner' }} />
        ) : user?.type === 'contributor' ? (
          <ContributorDashboard user={user as User & { type: 'contributor' }} />
        ) : null}
      </main>
    </div>
  );
}
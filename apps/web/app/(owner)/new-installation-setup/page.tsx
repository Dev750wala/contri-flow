'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RepositoryCard, { Repository } from '@/components/RepositoryCard';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Github,
  ArrowRight,
  Settings
} from 'lucide-react';

// Sample data for demonstration
const sampleRepositories: Repository[] = [
  {
    id: '1',
    name: 'awesome-project',
    owner: 'myorg',
    fullName: 'myorg/awesome-project',
    githubUrl: 'https://github.com/myorg/awesome-project',
    lastActivity: {
      type: 'commit',
      date: '2024-10-02T10:30:00Z',
      branch: 'main'
    },
    rewardsEnabled: true,
    rewardStats: {
      totalDistributed: 15750.50,
      contributorsRewarded: 23,
      currency: 'USDC'
    },
    maintainers: [
      {
        id: '1',
        username: 'johndoe',
        avatar: 'https://github.com/johndoe.png'
      },
      {
        id: '2', 
        username: 'janedoe',
        avatar: 'https://github.com/janedoe.png'
      },
      {
        id: '3',
        username: 'bobsmith'
      }
    ],
    tokenInfo: {
      symbol: 'USDC',
      address: '0xa0b86a33e6441e6a0be6d00a6b2b5bce7c63b8b1',
      name: 'USD Coin'
    },
    languages: [
      { name: 'TypeScript', color: '#3178c6' },
      { name: 'JavaScript', color: '#f1e05a' },
      { name: 'CSS', color: '#563d7c' },
      { name: 'HTML', color: '#e34c26' }
    ],
    webhookActive: true
  },
  {
    id: '2',
    name: 'web3-tools',
    owner: 'myorg',
    fullName: 'myorg/web3-tools',
    githubUrl: 'https://github.com/myorg/web3-tools',
    lastActivity: {
      type: 'pr',
      date: '2024-09-28T14:20:00Z',
      branch: 'feature/new-api'
    },
    rewardsEnabled: false,
    rewardStats: {
      totalDistributed: 0,
      contributorsRewarded: 0,
      currency: 'ETH'
    },
    maintainers: [
      {
        id: '1',
        username: 'johndoe',
        avatar: 'https://github.com/johndoe.png'
      }
    ],
    tokenInfo: {
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      name: 'Ethereum'
    },
    languages: [
      { name: 'Solidity', color: '#aa6746' },
      { name: 'JavaScript', color: '#f1e05a' },
      { name: 'Python', color: '#3572A5' },
      { name: 'Shell', color: '#89e051' }
    ],
    webhookActive: false
  },
  {
    id: '3',
    name: 'react-components',
    owner: 'myorg',
    fullName: 'myorg/react-components',
    githubUrl: 'https://github.com/myorg/react-components',
    lastActivity: {
      type: 'commit',
      date: '2024-10-01T09:15:00Z',
      branch: 'main'
    },
    rewardsEnabled: true,
    rewardStats: {
      totalDistributed: 2340.25,
      contributorsRewarded: 8,
      currency: 'USDT'
    },
    maintainers: [
      {
        id: '2',
        username: 'janedoe',
        avatar: 'https://github.com/janedoe.png'
      },
      {
        id: '4',
        username: 'alice'
      },
      {
        id: '5',
        username: 'charlie'
      },
      {
        id: '6',
        username: 'david'
      }
    ],
    tokenInfo: {
      symbol: 'USDT',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      name: 'Tether USD'
    },
    languages: [
      { name: 'TypeScript', color: '#3178c6' },
      { name: 'SCSS', color: '#c6538c' },
      { name: 'JavaScript', color: '#f1e05a' },
      { name: 'CSS', color: '#563d7c' },
      { name: 'HTML', color: '#e34c26' }
    ],
    webhookActive: true
  }
];

const NewInstallationPageContent = () => {
  const [repositories, setRepositories] = useState<Repository[]>(sampleRepositories);
  const searchParams = useSearchParams();
  
  // Get query parameters from GitHub App installation
  const setupAction = searchParams.get('setup_action');
  const installationId = searchParams.get('installation_id');
  const state = searchParams.get('state');

  const handleToggleRewards = (repoId: string, enabled: boolean) => {
    setRepositories(prev =>
      prev.map(repo =>
        repo.id === repoId ? { ...repo, rewardsEnabled: enabled } : repo
      )
    );
  };

  const handleManageSettings = (repoId: string) => {
    // This would typically navigate to a settings page or open a modal
    console.log('Managing settings for repository:', repoId);
    // For now, we'll just show an alert
    alert(`Managing settings for repository ${repoId}`);
  };

  // Render content based on setup_action
  const renderContent = () => {
    switch (setupAction) {
      case 'request':
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    Installation Request Submitted
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-orange-800 dark:text-orange-200">
                    Your request to install ContriFlow has been submitted to the organization owner.
                  </p>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300">
                        <Github className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The organization owner will receive a notification and can approve or deny the installation.
                      You'll be notified once a decision is made.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={() => window.close()}>
                      Close Window
                    </Button>
                    <Button asChild>
                      <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Installations
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'install':
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
              {/* Success Header */}
              <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-green-900 dark:text-green-100">
                    Installation Successful!
                  </h1>
                  <p className="text-green-700 dark:text-green-300 mt-2">
                    ContriFlow has been successfully installed. Now select which repositories you want to enable rewards for.
                  </p>
                </div>
                {installationId && (
                  <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                    Installation ID: {installationId}
                  </Badge>
                )}
              </div>

              {/* Repository Selection */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">Select Repositories</h2>
                  <p className="text-muted-foreground">
                    Choose which GitHub repositories you want to enable rewards for.
                  </p>
                </div>

                {/* Repository Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {repositories.map((repository) => (
                    <RepositoryCard
                      key={repository.id}
                      repository={repository}
                      onToggleRewards={handleToggleRewards}
                      onManageSettings={handleManageSettings}
                    />
                  ))}
                </div>

                {/* Save Button */}
                <div className="flex justify-center pt-6">
                  <Button size="lg" className="min-w-[200px]">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Continue Setup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'update':
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Installation Updated
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-blue-800 dark:text-blue-200">
                    Your ContriFlow installation has been successfully updated with new permissions or repository access.
                  </p>
                  {installationId && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                      Installation ID: {installationId}
                    </Badge>
                  )}
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={() => window.history.back()}>
                      Go Back
                    </Button>
                    <Button asChild>
                      <a href="/dashboard">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'cancel':
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-red-900 dark:text-red-100">
                    Installation Cancelled
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-red-800 dark:text-red-200">
                    The ContriFlow installation was cancelled. You can try installing again anytime.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={() => window.close()}>
                      Close Window
                    </Button>
                    <Button>
                      <Github className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        // No setup_action or unknown value - show general installation page
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">ContriFlow Setup</h1>
                <p className="text-muted-foreground">
                  Welcome to ContriFlow! Set up automated rewards for your GitHub repositories.
                </p>
              </div>

              {!setupAction && (
                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                  <CardContent className="flex items-center space-x-3 pt-6">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-yellow-800 dark:text-yellow-200">
                      It looks like you accessed this page directly. Please install the GitHub App first.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center">
                <Button size="lg" asChild>
                  <a href="https://github.com/apps/contriflow/installations/new" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    Install GitHub App
                  </a>
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Navbar />
      {renderContent()}
    </>
  );
};

const NewInstallationPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewInstallationPageContent />
    </Suspense>
  );
};

export default NewInstallationPage;
  
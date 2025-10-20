'use client';

import React, { useState } from 'react';
import RepositoryCard, { Repository } from '@/components/RepositoryCard';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data for testing the RepositoryCard UI
const sampleRepositories: Repository[] = [
  {
    id: '1',
    name: 'awesome-project',
    owner: 'TechCorp',
    fullName: 'TechCorp/awesome-project',
    githubUrl: 'https://github.com/TechCorp/awesome-project',
    rewardsEnabled: true,
    maintainers: [
      {
        id: 'm1',
        username: 'torvalds',
        avatar: 'https://github.com/torvalds.png',
      },
      {
        id: 'm2',
        username: 'gvanrossum',
        avatar: 'https://github.com/gvanrossum.png',
      },
      {
        id: 'm3',
        username: 'jordwalke',
        avatar: 'https://github.com/jordwalke.png',
      },
    ],
  },
  {
    id: '2',
    name: 'react-native',
    owner: 'facebook',
    fullName: 'facebook/react-native',
    githubUrl: 'https://github.com/facebook/react-native',
    rewardsEnabled: true,
    maintainers: [
      {
        id: 'm4',
        username: 'sophiebits',
        avatar: 'https://github.com/sophiebits.png',
      },
      {
        id: 'm5',
        username: 'acdlite',
        avatar: 'https://github.com/acdlite.png',
      },
      {
        id: 'm6',
        username: 'sebmarkbage',
        avatar: 'https://github.com/sebmarkbage.png',
      },
      {
        id: 'm7',
        username: 'bvaughn',
        avatar: 'https://github.com/bvaughn.png',
      },
      {
        id: 'm8',
        username: 'gaearon',
        avatar: 'https://github.com/gaearon.png',
      },
    ],
  },
  {
    id: '3',
    name: 'typescript',
    owner: 'microsoft',
    fullName: 'microsoft/typescript',
    githubUrl: 'https://github.com/microsoft/typescript',
    rewardsEnabled: false,
    maintainers: [
      {
        id: 'm9',
        username: 'RyanCavanaugh',
        avatar: 'https://github.com/RyanCavanaugh.png',
      },
      {
        id: 'm10',
        username: 'DanielRosenwasser',
        avatar: 'https://github.com/DanielRosenwasser.png',
      },
    ],
  },
  {
    id: '4',
    name: 'vscode',
    owner: 'microsoft',
    fullName: 'microsoft/vscode',
    githubUrl: 'https://github.com/microsoft/vscode',
    rewardsEnabled: true,
    maintainers: [
      {
        id: 'm11',
        username: 'bpasero',
        avatar: 'https://github.com/bpasero.png',
      },
      {
        id: 'm12',
        username: 'joaomoreno',
        avatar: 'https://github.com/joaomoreno.png',
      },
      {
        id: 'm13',
        username: 'chrmarti',
        avatar: 'https://github.com/chrmarti.png',
      },
      {
        id: 'm14',
        username: 'mjbvz',
        avatar: 'https://github.com/mjbvz.png',
      },
      {
        id: 'm15',
        username: 'roblourens',
        avatar: 'https://github.com/roblourens.png',
      },
      {
        id: 'm16',
        username: 'rebornix',
        avatar: 'https://github.com/rebornix.png',
      },
    ],
  },
  {
    id: '5',
    name: 'next.js',
    owner: 'vercel',
    fullName: 'vercel/next.js',
    githubUrl: 'https://github.com/vercel/next.js',
    rewardsEnabled: false,
    maintainers: [
      {
        id: 'm17',
        username: 'timneutkens',
        avatar: 'https://github.com/timneutkens.png',
      },
      {
        id: 'm18',
        username: 'ijjk',
        avatar: 'https://github.com/ijjk.png',
      },
      {
        id: 'm19',
        username: 'shuding',
        avatar: 'https://github.com/shuding.png',
      },
      {
        id: 'm20',
        username: 'huozhi',
        avatar: 'https://github.com/huozhi.png',
      },
    ],
  },
  {
    id: '6',
    name: 'backend-api',
    owner: 'StartupInc',
    fullName: 'StartupInc/backend-api',
    githubUrl: 'https://github.com/StartupInc/backend-api',
    rewardsEnabled: true,
    maintainers: [
      {
        id: 'm21',
        username: 'octocat',
        avatar: 'https://github.com/octocat.png',
      },
    ],
  },
  {
    id: '7',
    name: 'mobile-app',
    owner: 'StartupInc',
    fullName: 'StartupInc/mobile-app',
    githubUrl: 'https://github.com/StartupInc/mobile-app',
    rewardsEnabled: false,
    maintainers: [],
  },
  {
    id: '8',
    name: 'rust',
    owner: 'rust-lang',
    fullName: 'rust-lang/rust',
    githubUrl: 'https://github.com/rust-lang/rust',
    rewardsEnabled: true,
    maintainers: [
      {
        id: 'm22',
        username: 'nikomatsakis',
        avatar: 'https://github.com/nikomatsakis.png',
      },
      {
        id: 'm23',
        username: 'aturon',
        avatar: 'https://github.com/aturon.png',
      },
      {
        id: 'm24',
        username: 'brson',
        avatar: 'https://github.com/brson.png',
      },
    ],
  },
];

const SampleCardsPage = () => {
  const [repositories, setRepositories] = useState<Repository[]>(sampleRepositories);

  const handleToggleRewards = (repoId: string, enabled: boolean) => {
    setRepositories((prev) =>
      prev.map((repo) =>
        repo.id === repoId ? { ...repo, rewardsEnabled: enabled } : repo
      )
    );
  };

  const handleManageSettings = (repoId: string) => {
    const repo = repositories.find((r) => r.id === repoId);
    alert(`Manage settings for: ${repo?.fullName}\nCurrent status: ${repo?.rewardsEnabled ? 'Active' : 'Inactive'}`);
  };

  const activeCount = repositories.filter((r) => r.rewardsEnabled).length;
  const inactiveCount = repositories.length - activeCount;

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Repository Cards Preview</h1>
              <p className="text-muted-foreground mt-2">
                Sample data showcasing the RepositoryCard component with various states and configurations.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Repositories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{repositories.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {activeCount}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Inactive
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {inactiveCount}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Repository Grid */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Repository Cards</h2>
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
          </div>

          {/* Instructions */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                💡 Interactive Features
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800 dark:text-blue-200 space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Click the <strong>Active/Inactive badge</strong> to toggle rewards on/off</li>
                <li>Hover over cards to see animations and effects</li>
                <li>Click <strong>Manage Settings</strong> or <strong>Enable Rewards</strong> buttons</li>
                <li>Hover over maintainer avatars to see their usernames</li>
                <li>Click the GitHub link to visit repositories (will try to open real GitHub pages)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SampleCardsPage;

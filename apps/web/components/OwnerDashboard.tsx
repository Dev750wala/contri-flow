import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';
import {
  Wallet,
  Plus,
  Github,
  DollarSign,
  Users,
  GitPullRequest,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  avatar: string;
  type: 'owner' | 'contributor';
  walletConnected: boolean;
}

interface OwnerDashboardProps {
  user: User;
}

export function OwnerDashboard({ user }: OwnerDashboardProps) {
  const [selectedRepo, setSelectedRepo] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // Mock data
  const repositories = [
    {
      id: 'repo1',
      name: 'awesome-project',
      balance: 2.5,
      contributors: 12,
      totalRewards: 15.8,
      pendingPRs: 3,
      status: 'active',
    },
    {
      id: 'repo2',
      name: 'cool-library',
      balance: 1.2,
      contributors: 8,
      totalRewards: 8.4,
      pendingPRs: 1,
      status: 'active',
    },
    {
      id: 'repo3',
      name: 'legacy-app',
      balance: 0.1,
      contributors: 4,
      totalRewards: 3.2,
      pendingPRs: 0,
      status: 'low_funds',
    },
  ];

  const recentTransactions = [
    {
      id: 'tx1',
      type: 'reward',
      amount: 0.5,
      contributor: 'dev-alice',
      repo: 'awesome-project',
      timestamp: '2 hours ago',
    },
    {
      id: 'tx2',
      type: 'deposit',
      amount: 2.0,
      repo: 'cool-library',
      timestamp: '1 day ago',
    },
    {
      id: 'tx3',
      type: 'reward',
      amount: 0.3,
      contributor: 'code-bob',
      repo: 'awesome-project',
      timestamp: '2 days ago',
    },
    {
      id: 'tx4',
      type: 'reward',
      amount: 0.8,
      contributor: 'fix-master',
      repo: 'cool-library',
      timestamp: '3 days ago',
    },
  ];

  const pendingRewards = [
    {
      id: 'pr1',
      contributor: 'new-contributor',
      repo: 'awesome-project',
      amount: 0.4,
      pr: '#124',
      description: 'Add new authentication feature',
    },
    {
      id: 'pr2',
      contributor: 'bug-hunter',
      repo: 'awesome-project',
      amount: 0.2,
      pr: '#125',
      description: 'Fix memory leak in parser',
    },
    {
      id: 'pr3',
      contributor: 'ui-expert',
      repo: 'cool-library',
      amount: 0.6,
      pr: '#67',
      description: 'Redesign component library',
    },
  ];

  const totalBalance = repositories.reduce(
    (sum, repo) => sum + repo.balance,
    0
  );
  const totalContributors = repositories.reduce(
    (sum, repo) => sum + repo.contributors,
    0
  );
  const totalRewardsDistributed = repositories.reduce(
    (sum, repo) => sum + repo.totalRewards,
    0
  );

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBalance.toFixed(2)} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ ${(totalBalance * 2500).toFixed(0)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Contributors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContributors}</div>
            <p className="text-xs text-muted-foreground">
              Across {repositories.length} repositories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRewardsDistributed.toFixed(1)} ETH
            </div>
            <p className="text-xs text-muted-foreground">Distributed to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRewards.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting reward distribution
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="repositories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="pending">Pending Rewards</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories" className="space-y-6">
          {/* Add Repository Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Repository
              </CardTitle>
              <CardDescription>
                Connect a new GitHub repository to start rewarding contributors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="github.com/username/repository"
                    className="w-full"
                  />
                </div>
                <Button>
                  <Github className="h-4 w-4 mr-2" />
                  Connect Repository
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Repository List */}
          <div className="grid gap-6">
            {repositories.map((repo) => (
              <Card key={repo.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">{repo.name}</CardTitle>
                        <CardDescription>
                          {repo.contributors} contributors • {repo.totalRewards}{' '}
                          ETH distributed
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {repo.status === 'active' ? (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Low Funds
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="text-lg font-semibold">
                        {repo.balance.toFixed(2)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Contributors
                      </p>
                      <p className="text-lg font-semibold">
                        {repo.contributors}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pending PRs
                      </p>
                      <p className="text-lg font-semibold">{repo.pendingPRs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Rewards
                      </p>
                      <p className="text-lg font-semibold">
                        {repo.totalRewards.toFixed(1)} ETH
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor={`deposit-${repo.id}`} className="text-sm">
                        Deposit Amount (ETH)
                      </Label>
                      <Input
                        id={`deposit-${repo.id}`}
                        placeholder="0.0"
                        type="number"
                        step="0.1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button>
                        <Wallet className="h-4 w-4 mr-2" />
                        Deposit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reward Distributions</CardTitle>
              <CardDescription>
                Review and approve rewards for merged pull requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{reward.repo}</Badge>
                        <Badge variant="secondary">{reward.pr}</Badge>
                      </div>
                      <h4 className="font-medium">{reward.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        by @{reward.contributor}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{reward.amount} ETH</p>
                        <p className="text-sm text-muted-foreground">
                          ≈ ${(reward.amount * 2500).toFixed(0)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Reject
                        </Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your deposit and reward distribution history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {tx.type === 'reward' ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Wallet className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">
                          {tx.type === 'reward'
                            ? `Reward to @${tx.contributor}`
                            : 'Deposit to repository'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {tx.repo} • {tx.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {tx.type === 'reward' ? '-' : '+'}
                        {tx.amount} ETH
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ≈ ${(tx.amount * 2500).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reward Settings</CardTitle>
              <CardDescription>
                Configure automatic reward distributions for your repositories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Default Reward Amount</Label>
                  <div className="flex gap-2 mt-1">
                    <Input placeholder="0.5" type="number" step="0.1" />
                    <Select defaultValue="eth">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eth">ETH</SelectItem>
                        <SelectItem value="usd">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Minimum Contribution Size</Label>
                  <Select defaultValue="small">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any size</SelectItem>
                      <SelectItem value="small">Small (10+ lines)</SelectItem>
                      <SelectItem value="medium">Medium (50+ lines)</SelectItem>
                      <SelectItem value="large">Large (100+ lines)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Auto-approve rewards</Label>
                  <Select defaultValue="manual">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual approval</SelectItem>
                      <SelectItem value="auto">Auto-approve</SelectItem>
                      <SelectItem value="threshold">
                        Auto-approve under threshold
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
  Building2,
  TrendingUp,
  Clock,
  Settings,
  ArrowUpRight,
  Package,
  Activity,
  Zap,
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

// Types based on Prisma Schema - Organization level deposits
interface Organization {
  id: string;
  name: string;
  github_org_id: string;
  installation_id: string;
  app_installed: boolean;
  suspended: boolean;
  total_balance: number; // Organization-wide balance
  repositories: Repository[];
  created_at: Date;
}

interface Repository {
  id: string;
  name: string;
  github_repo_id: string;
  enabled_rewards: boolean;
  is_removed: boolean;
  maintainers: RepositoryMaintainer[];
  rewards: Reward[];
  created_at: Date;
}

interface RepositoryMaintainer {
  id: string;
  github_id: string;
  role: 'ADMIN' | 'MAINTAIN';
}

interface Reward {
  id: string;
  pr_number: number;
  token_amount: string;
  claimed: boolean;
  confirmed: boolean;
  contributor_id: string;
  comment: string;
  created_at: Date;
  payout?: {
    tx_hash: string;
    destination_chain: string;
    receiver_address: string;
  };
}

interface Contributor {
  id: string;
  github_id: string;
  email?: string;
}

export function OwnerDashboard({ user }: OwnerDashboardProps) {
  const [selectedOrg, setSelectedOrg] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);

  // Mock data - Organization-level balance
  const organizations: Organization[] = [
    {
      id: 'org_1',
      name: 'My Organization',
      github_org_id: 'github_org_123',
      installation_id: 'inst_456',
      app_installed: true,
      suspended: false,
      total_balance: 5.8, // All funds at organization level
      created_at: new Date('2024-01-15'),
      repositories: [
        {
          id: 'repo_1',
          name: 'awesome-project',
          github_repo_id: 'gh_repo_001',
          enabled_rewards: true,
          is_removed: false,
          created_at: new Date('2024-01-20'),
          maintainers: [
            { id: 'maint_1', github_id: 'user_123', role: 'ADMIN' },
            { id: 'maint_2', github_id: 'user_456', role: 'MAINTAIN' },
          ],
          rewards: [
            {
              id: 'reward_1',
              pr_number: 124,
              token_amount: '0.5',
              claimed: true,
              confirmed: true,
              contributor_id: 'contrib_1',
              comment: 'Great contribution!',
              created_at: new Date('2024-10-10'),
              payout: {
                tx_hash: '0x123abc...',
                destination_chain: 'ethereum',
                receiver_address: '0xabc...',
              },
            },
            {
              id: 'reward_2',
              pr_number: 125,
              token_amount: '0.3',
              claimed: false,
              confirmed: true,
              contributor_id: 'contrib_2',
              comment: 'Bug fix reward',
              created_at: new Date('2024-11-01'),
            },
          ],
        },
        {
          id: 'repo_2',
          name: 'cool-library',
          github_repo_id: 'gh_repo_002',
          enabled_rewards: true,
          is_removed: false,
          created_at: new Date('2024-02-10'),
          maintainers: [
            { id: 'maint_3', github_id: 'user_123', role: 'ADMIN' },
          ],
          rewards: [
            {
              id: 'reward_3',
              pr_number: 67,
              token_amount: '0.8',
              claimed: true,
              confirmed: true,
              contributor_id: 'contrib_3',
              comment: 'UI improvements',
              created_at: new Date('2024-10-20'),
              payout: {
                tx_hash: '0x456def...',
                destination_chain: 'base',
                receiver_address: '0xdef...',
              },
            },
          ],
        },
        {
          id: 'repo_3',
          name: 'frontend-app',
          github_repo_id: 'gh_repo_003',
          enabled_rewards: false,
          is_removed: false,
          created_at: new Date('2024-03-01'),
          maintainers: [
            { id: 'maint_4', github_id: 'user_789', role: 'MAINTAIN' },
          ],
          rewards: [],
        },
      ],
    },
  ];

  // Calculate statistics
  const totalOrgBalance = organizations.reduce(
    (sum, org) => sum + org.total_balance,
    0
  );

  const allRepositories = organizations.flatMap((org) => org.repositories);
  const activeRepositories = allRepositories.filter(
    (repo) => repo.enabled_rewards && !repo.is_removed
  );

  const allRewards = allRepositories.flatMap((repo) => repo.rewards);
  const totalRewardsDistributed = allRewards
    .filter((r) => r.claimed)
    .reduce((sum, r) => sum + parseFloat(r.token_amount), 0);

  const pendingRewards = allRewards.filter((r) => !r.claimed && r.confirmed);
  const totalPendingAmount = pendingRewards.reduce(
    (sum, r) => sum + parseFloat(r.token_amount),
    0
  );

  const uniqueContributors = new Set(allRewards.map((r) => r.contributor_id))
    .size;

  const recentTransactions = allRewards
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, 5)
    .map((reward) => {
      const repo = allRepositories.find((r) =>
        r.rewards.some((rw) => rw.id === reward.id)
      );
      return {
        id: reward.id,
        type: reward.claimed ? 'reward_claimed' : 'reward_issued',
        amount: parseFloat(reward.token_amount),
        pr_number: reward.pr_number,
        repo_name: repo?.name || 'Unknown',
        contributor_id: reward.contributor_id,
        tx_hash: reward.payout?.tx_hash,
        timestamp: reward.created_at,
      };
    });

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview - Compact Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all border-l-4 border-l-cyan-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Balance
              </CardTitle>
              <Wallet className="h-4 w-4 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrgBalance.toFixed(2)} ETH</div>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ ${(totalOrgBalance * 2500).toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contributors
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueContributors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeRepositories.length} active repos
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Distributed
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRewardsDistributed.toFixed(1)} ETH
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <GitPullRequest className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRewards.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPendingAmount.toFixed(2)} ETH
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Organizations & Repositories (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {organizations.map((org) => (
            <Card key={org.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Building2 className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{org.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Package className="h-3 w-3" />
                        {org.repositories.length} repositories
                        {org.app_installed && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>App Installed</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={org.suspended ? 'destructive' : 'default'}
                    className="bg-green-500/20 text-green-700 hover:bg-green-500/30"
                  >
                    {org.suspended ? 'Suspended' : 'Active'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Organization Balance & Deposit */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Organization Balance
                      </Label>
                      <div className="text-2xl font-bold text-cyan-500 mt-1">
                        {org.total_balance.toFixed(2)} ETH
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Shared across {org.repositories.filter((r) => r.enabled_rewards).length} enabled repositories
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-cyan-500/50" />
                  </div>
                  <Separator className="my-3" />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Amount (ETH)"
                      type="number"
                      step="0.1"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button className="bg-cyan-500 hover:bg-cyan-600">
                      <Wallet className="h-4 w-4 mr-2" />
                      Deposit
                    </Button>
                  </div>
                </div>

                {/* Repositories Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      Repositories
                    </h3>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add New
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    {org.repositories
                      .filter((repo) => !repo.is_removed)
                      .map((repo) => {
                        const repoRewards = repo.rewards;
                        const totalDistributed = repoRewards
                          .filter((r) => r.claimed)
                          .reduce((sum, r) => sum + parseFloat(r.token_amount), 0);
                        const pendingCount = repoRewards.filter(
                          (r) => !r.claimed && r.confirmed
                        ).length;
                        const uniqueRepoContributors = new Set(
                          repoRewards.map((r) => r.contributor_id)
                        ).size;

                        return (
                          <Card
                            key={repo.id}
                            className={`hover:shadow-md transition-all cursor-pointer ${
                              selectedRepo === repo.id
                                ? 'ring-2 ring-cyan-500 bg-cyan-500/5'
                                : ''
                            }`}
                            onClick={() => setSelectedRepo(repo.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="p-2 bg-muted rounded">
                                    <Github className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold truncate">
                                        {repo.name}
                                      </h4>
                                      {repo.enabled_rewards ? (
                                        <Badge
                                          variant="default"
                                          className="bg-green-500/20 text-green-700 text-xs"
                                        >
                                          <Zap className="h-2 w-2 mr-1" />
                                          Rewards On
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs">
                                          Rewards Off
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {uniqueRepoContributors}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Activity className="h-3 w-3" />
                                        {repo.maintainers.length} maintainers
                                      </span>
                                      {pendingCount > 0 && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs px-1.5 py-0"
                                        >
                                          {pendingCount} pending
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="flex-shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Open GitHub
                                  }}
                                >
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <span className="text-muted-foreground text-xs">
                                    Distributed
                                  </span>
                                  <span className="font-semibold">
                                    {totalDistributed.toFixed(2)} ETH
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                                  <span className="text-muted-foreground text-xs">
                                    Total PRs
                                  </span>
                                  <span className="font-semibold">
                                    {repoRewards.length}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Column - Activity & Quick Actions (1/3 width) */}
        <div className="space-y-6">
          {/* Pending Rewards Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Pending Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRewards.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>All caught up!</p>
                </div>
              ) : (
                pendingRewards.slice(0, 3).map((reward) => {
                  const repo = allRepositories.find((r) =>
                    r.rewards.some((rw) => rw.id === reward.id)
                  );
                  return (
                    <div
                      key={reward.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs mb-1">
                            #{reward.pr_number}
                          </Badge>
                          <p className="text-sm font-medium truncate">
                            {reward.comment}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {repo?.name}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-cyan-500">
                            {parseFloat(reward.token_amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">ETH</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                          Reject
                        </Button>
                        <Button size="sm" className="flex-1 h-7 text-xs bg-cyan-500 hover:bg-cyan-600">
                          Approve
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
              {pendingRewards.length > 3 && (
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View all {pendingRewards.length} pending
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activity yet</p>
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`p-1.5 rounded-full flex-shrink-0 ${
                        tx.type === 'reward_claimed'
                          ? 'bg-green-500/20'
                          : 'bg-blue-500/20'
                      }`}
                    >
                      {tx.type === 'reward_claimed' ? (
                        <DollarSign className="h-3 w-3 text-green-500" />
                      ) : (
                        <Clock className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        PR #{tx.pr_number} •{' '}
                        {tx.type === 'reward_claimed' ? 'Claimed' : 'Issued'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.repo_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(tx.timestamp)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold">
                        {tx.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">ETH</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Organizations</span>
                </div>
                <span className="font-bold">{organizations.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Repositories</span>
                </div>
                <span className="font-bold">{allRepositories.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Rewards Enabled</span>
                </div>
                <span className="font-bold">{activeRepositories.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total PRs</span>
                </div>
                <span className="font-bold">{allRewards.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add Repository
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Wallet className="h-4 w-4 mr-2" />
                Deposit Funds
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Github className="h-4 w-4 mr-2" />
                Manage Installations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

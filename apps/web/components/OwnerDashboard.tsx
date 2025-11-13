import React, { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
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
  Activity as ActivityIcon,
  Zap,
  ShoppingCart,
  ArrowRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import type {
  GetOwnerDashboardQuery,
  Activity,
  GetOrganizationStatsQuery,
  GetGlobalStatsQuery,
  GetPendingRewardsQuery,
} from '@/codegen/generated/graphql';
import { useAccount } from 'wagmi';
import { useContriFlowContract } from '@/hooks/useContriFlowContract';

interface OwnerDashboardProps {
  organizations: GetOwnerDashboardQuery['getOwnerDashboard']['organizations'];
  selectedOrg: GetOwnerDashboardQuery['getOwnerDashboard']['organizations'][0] | null;
  selectedOrgId: string;
  activities: Activity[];
  pendingRewards: GetPendingRewardsQuery['getPendingRewards'];
  orgStats: GetOrganizationStatsQuery['getOrganizationStats'] | null;
  globalStats: GetGlobalStatsQuery['getGlobalStats'] | null;
  orgStatsLoading: boolean;
  allRepositories: Array<GetOwnerDashboardQuery['getOwnerDashboard']['organizations'][0]['repositories'][0]>;
  onSelectOrganization: (orgId: string) => void;
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

export function OwnerDashboard({
  organizations,
  selectedOrg,
  selectedOrgId,
  activities,
  pendingRewards,
  orgStats,
  globalStats,
  orgStatsLoading,
  allRepositories,
  onSelectOrganization,
}: OwnerDashboardProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositStep, setDepositStep] = useState<'idle' | 'approving' | 'approved' | 'adding' | 'success' | 'error'>('idle');
  const [depositError, setDepositError] = useState<string>('');
  const { isConnected, address } = useAccount();
  
  // Use custom hook to fetch wallet balance and organization funds
  const {
    walletBalance,
    orgBalance,
    isLoadingWallet,
    isLoadingOrg,
    refetchWalletBalance,
    refetchOrgBalance,
    approveTokens,
    addFunds,
    isApprovePending,
    isApproveConfirming,
    isApproveSuccess,
    isAddAmountPending,
    isAddAmountConfirming,
    isAddAmountSuccess,
    approveError,
    addAmountError,
  } = useContriFlowContract(selectedOrg?.githubOrgId);

  // Helper function to convert from Wei (18 decimals) to token amount
  const fromWei = (weiAmount: string | number): number => {
    const weiString = typeof weiAmount === 'number' ? weiAmount.toString() : weiAmount;
    return parseFloat(weiString) / Math.pow(10, 18);
  };

  // Track approval transaction state
  useEffect(() => {
    if (isApprovePending) {
      setDepositStep('approving');
      setDepositError('');
    } else if (isApproveConfirming) {
      setDepositStep('approving');
    } else if (isApproveSuccess && depositStep === 'approving') {
      setDepositStep('approved');
    } else if (approveError) {
      setDepositStep('error');
      setDepositError(approveError.message || 'Failed to approve tokens');
    }
  }, [isApprovePending, isApproveConfirming, isApproveSuccess, approveError, depositStep]);

  // Track addAmount transaction state
  useEffect(() => {
    if (isAddAmountPending) {
      setDepositStep('adding');
      setDepositError('');
    } else if (isAddAmountConfirming) {
      setDepositStep('adding');
    } else if (isAddAmountSuccess && depositStep === 'adding') {
      setDepositStep('success');
      // Reset after showing success
      setTimeout(() => {
        setIsDepositModalOpen(false);
        setDepositAmount('');
        setDepositStep('idle');
      }, 2000);
    } else if (addAmountError) {
      setDepositStep('error');
      setDepositError(addAmountError.message || 'Failed to add funds');
    }
  }, [isAddAmountPending, isAddAmountConfirming, isAddAmountSuccess, addAmountError, depositStep]);

  // Auto-trigger addFunds after approval
  useEffect(() => {
    if (depositStep === 'approved' && selectedOrg?.githubOrgId) {
      handleAddFunds();
    }
  }, [depositStep, selectedOrg?.githubOrgId]);

  // Handle deposit button click - Step 1: Approve tokens
  const handleDeposit = async () => {
    if (!depositAmount || !selectedOrg?.githubOrgId) return;

    try {
      setDepositError('');
      await approveTokens(depositAmount);
    } catch (error: any) {
      console.error('Deposit error:', error);
      setDepositStep('error');
      setDepositError(error.message || 'Failed to initiate deposit');
    }
  };

  // Step 2: Add funds to organization
  const handleAddFunds = async () => {
    if (!selectedOrg?.githubOrgId) return;

    try {
      await addFunds(selectedOrg.githubOrgId);
    } catch (error: any) {
      console.error('Add funds error:', error);
      setDepositStep('error');
      setDepositError(error.message || 'Failed to add funds');
    }
  };

  // Calculate statistics from real data
  const activeRepositories = selectedOrg?.repositories.filter(
    (repo) => repo.enabled_rewards && !repo.is_removed
  ) || [];

  const totalPendingAmount = pendingRewards.reduce(
    (sum, r) => sum + fromWei(r.token_amount),
    0
  );

  // Calculate values from stats or fallback to 0
  // Use contract balance if available, otherwise fall back to stats
  const totalOrgBalance = isLoadingOrg 
    ? (globalStats?.totalBalance ?? orgStats?.totalBalance ?? 0)
    : orgBalance;
  const uniqueContributors = globalStats?.totalContributors ?? orgStats?.uniqueContributors ?? 0;
  const totalRewardsDistributed = globalStats?.totalRewardsDistributed ?? orgStats?.totalRewardsDistributed ?? 0;
  
  // Calculate all rewards from all repositories
  const allRewards = allRepositories.flatMap((repo) => {
    // Repositories from the query don't have rewards, so we'll need to get them from pendingRewards
    // or calculate from other sources. For now, return empty array.
    return [];
  });

  const recentTransactions = activities.slice(0, 5).map((activity) => {
    // Try to find repository name from the activity's repository_id
    let repoName = 'Unknown';
    if (activity.repository_id) {
      const repo = allRepositories.find((r) => r.id === activity.repository_id);
      repoName = repo?.name || 'Repository';
    }
    
    return {
      id: activity.id,
      type: activity.activity_type,
      amount: activity.amount ? fromWei(activity.amount) : 0,
      pr_number: activity.pr_number,
      repo_name: repoName,
      contributor_id: activity.actor_id || '',
      actor_name: activity.actor_name || 'User',
      title: activity.title,
      description: activity.description,
      timestamp: new Date(activity.created_at),
      status: activity.activity_type.includes('CLAIMED') ? 'claimed' : 'pending',
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
            <div className="text-2xl font-bold">{totalOrgBalance.toFixed(2)} MPT</div>
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
              {totalRewardsDistributed.toFixed(1)} MPT
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
              {totalPendingAmount.toFixed(2)} MPT
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Organizations & Repositories (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {organizations.map((org) => (
            <Card key={org.id} className="overflow-hidden !border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
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
                        {org.appInstalled && (
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
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Organization Balance
                      </Label>
                      <div className="text-2xl font-bold text-cyan-500 mt-1">
                        {isLoadingOrg ? (
                          <span className="text-sm">Loading...</span>
                        ) : (
                          `${orgBalance.toFixed(2)} MPT`
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Shared across {org.repositories.filter((r) => r.enabled_rewards).length} enabled repositories
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Wallet className="h-8 w-8 text-cyan-500/50" />
                      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            className="h-10 w-10 rounded-full bg-cyan-500 hover:bg-cyan-600 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!isConnected}
                            title={!isConnected ? "Connect your wallet to deposit" : "Add funds to organization"}
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader className="space-y-3 pb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                                <Wallet className="h-6 w-6 text-cyan-500" />
                              </div>
                              <div>
                                <DialogTitle className="text-xl font-bold">Deposit MPT Tokens</DialogTitle>
                                <DialogDescription className="text-sm">
                                  Fund your organization to reward contributors
                                </DialogDescription>
                              </div>
                            </div>
                          </DialogHeader>

                          <div className="space-y-5 py-2">
                            {/* Balance Cards */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Wallet Balance Card */}
                              <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent p-4">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl" />
                                <div className="relative">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Wallet className="h-4 w-4 text-cyan-500" />
                                    <span className="text-xs font-medium text-muted-foreground">Your Wallet</span>
                                  </div>
                                  {isLoadingWallet ? (
                                    <div className="h-8 flex items-center">
                                      <span className="text-sm text-muted-foreground">Loading...</span>
                                    </div>
                                  ) : (
                                    <div className="text-2xl font-bold text-cyan-500">
                                      {walletBalance.toFixed(2)}
                                    </div>
                                  )}
                                  <span className="text-xs text-muted-foreground">MPT</span>
                                </div>
                              </div>

                              {/* Organization Balance Card */}
                              <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-4">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                                <div className="relative">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="h-4 w-4 text-blue-500" />
                                    <span className="text-xs font-medium text-muted-foreground">Organization</span>
                                  </div>
                                  {isLoadingOrg ? (
                                    <div className="h-8 flex items-center">
                                      <span className="text-sm text-muted-foreground">Loading...</span>
                                    </div>
                                  ) : (
                                    <div className="text-2xl font-bold text-blue-500">
                                      {orgBalance.toFixed(2)}
                                    </div>
                                  )}
                                  <span className="text-xs text-muted-foreground">MPT</span>
                                </div>
                              </div>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-2">
                              <Label htmlFor="deposit-amount" className="text-sm font-semibold">
                                Deposit Amount
                              </Label>
                              <div className="relative">
                                <Input
                                  id="deposit-amount"
                                  placeholder="0.00"
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={depositAmount}
                                  onChange={(e) => setDepositAmount(e.target.value)}
                                  className={`h-14 text-lg pr-16 ${
                                    depositAmount && parseFloat(depositAmount) > walletBalance
                                      ? 'border-red-500 focus-visible:ring-red-500'
                                      : 'border-cyan-500/50 focus-visible:ring-cyan-500'
                                  }`}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                  MPT
                                </div>
                              </div>

                              {/* Quick Amount Buttons */}
                              <div className="flex gap-2">
                                {[10, 50, 100, 500].map((amount) => (
                                  <Button
                                    key={amount}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-xs"
                                    onClick={() => setDepositAmount(amount.toString())}
                                    disabled={amount > walletBalance}
                                  >
                                    {amount}
                                  </Button>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs px-2"
                                  onClick={() => setDepositAmount(walletBalance.toString())}
                                  disabled={walletBalance <= 0}
                                >
                                  Max
                                </Button>
                              </div>

                              {/* Error Message */}
                              {depositAmount && parseFloat(depositAmount) > walletBalance && (
                                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 space-y-2">
                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                      Insufficient Balance
                                    </p>
                                    <p className="text-xs text-red-600/80 dark:text-red-400/80">
                                      You need {parseFloat(depositAmount).toFixed(2)} MPT but only have {walletBalance.toFixed(2)} MPT
                                    </p>
                                    <Link href="/trade">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2 border-red-500/50 hover:bg-red-500/10 text-red-600 dark:text-red-400"
                                      >
                                        <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                                        Buy More MPT Tokens
                                        <ArrowRight className="h-3.5 w-3.5 ml-2" />
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* After Deposit Preview */}
                            {depositAmount && parseFloat(depositAmount) > 0 && parseFloat(depositAmount) <= walletBalance && (
                              <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-muted-foreground">After Deposit</span>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-bold text-green-500">
                                    {(orgBalance + parseFloat(depositAmount)).toFixed(2)}
                                  </span>
                                  <span className="text-sm text-muted-foreground">MPT</span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                                  <span>
                                    +{parseFloat(depositAmount).toFixed(2)} MPT increase
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Low Balance Warning */}
                            {walletBalance > 0 && walletBalance < 10 && (
                              <div className="flex items-start gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                    Low Balance
                                  </p>
                                  <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">
                                    Consider buying more tokens to ensure uninterrupted rewards
                                  </p>
                                  <Link href="/trade">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 mt-2 px-0 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-transparent"
                                    >
                                      Buy MPT Tokens
                                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Info about the two-step process */}
                          {depositStep === 'idle' && depositAmount && parseFloat(depositAmount) > 0 && parseFloat(depositAmount) <= walletBalance && (
                            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                  Two-Step Deposit Process
                                </p>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                                  1. Approve the contract to spend your MPT tokens
                                </p>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                                  2. Deposit the approved tokens to your organization
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Transaction Status */}
                          {(depositStep !== 'idle' && depositStep !== 'error') && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {depositStep === 'approving' && 'Step 1/2: Approving tokens...'}
                                    {depositStep === 'approved' && 'Step 2/2: Adding funds to organization...'}
                                    {depositStep === 'adding' && 'Step 2/2: Adding funds to organization...'}
                                    {depositStep === 'success' && '✓ Deposit successful!'}
                                  </p>
                                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                                    {depositStep === 'approving' && 'Please confirm the approval in your wallet'}
                                    {depositStep === 'approved' && 'Approval confirmed! Proceeding to add funds...'}
                                    {depositStep === 'adding' && 'Please confirm the transaction in your wallet'}
                                    {depositStep === 'success' && 'Your funds have been added to the organization'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Error Display */}
                          {depositError && depositStep === 'error' && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                              <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                    Transaction Failed
                                  </p>
                                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                                    {depositError}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsDepositModalOpen(false);
                                setDepositAmount('');
                                setDepositStep('idle');
                                setDepositError('');
                              }}
                              className="flex-1 sm:flex-none"
                              disabled={depositStep === 'approving' || depositStep === 'adding'}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              className="flex-1 sm:flex-none bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                              disabled={
                                !depositAmount || 
                                parseFloat(depositAmount) <= 0 || 
                                parseFloat(depositAmount) > walletBalance ||
                                isLoadingWallet ||
                                isLoadingOrg ||
                                depositStep === 'approving' ||
                                depositStep === 'adding' ||
                                depositStep === 'success'
                              }
                              onClick={handleDeposit}
                            >
                              <Wallet className="h-4 w-4 mr-2" />
                              {depositStep === 'idle' && `Deposit ${depositAmount ? parseFloat(depositAmount).toFixed(2) : ''} MPT`}
                              {depositStep === 'approving' && 'Approving...'}
                              {depositStep === 'approved' && 'Adding Funds...'}
                              {depositStep === 'adding' && 'Adding Funds...'}
                              {depositStep === 'success' && '✓ Success!'}
                              {depositStep === 'error' && 'Try Again'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
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
                        // Get rewards for this repo from allRewards
                        const repoRewards = allRewards.filter((r) => {
                          // Match by repository - we need to find rewards for this repo
                          // Since rewards don't have direct repo reference in the query, 
                          // we'll use a placeholder for now
                          return true; // TODO: Filter by repository_id when available
                        });
                        const totalDistributed = repoRewards
                          .filter((r) => r.claimed)
                          .reduce((sum, r) => sum + fromWei(r.token_amount), 0);
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
                                        <ActivityIcon className="h-3 w-3" />
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
                              
                              {/* Distribution Info */}
                              <div className="mt-3 pt-3 border-t">
                                {totalDistributed > 0 ? (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      Distributed
                                    </span>
                                    <span className="text-sm font-semibold text-cyan-500">
                                      {totalDistributed.toFixed(2)} MPT
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-center py-2">
                                    <p className="text-xs text-muted-foreground">
                                      No rewards distributed yet
                                    </p>
                                  </div>
                                )}
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
                  // Find repository by matching reward's repository_id if available
                  // For now, we'll just use the first repository as a fallback
                  const repo = allRepositories.find((r) => r.id === reward.repository?.id) || allRepositories[0];
                  return (
                    <div
                      key={reward.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Badge variant="outline" className="text-xs mb-1">
                            #{reward.pr_number}
                          </Badge>
                          <p className="text-sm font-medium truncate">
                            {reward.comment}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {repo?.name || 'Repository'}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-cyan-500">
                            {fromWei(reward.token_amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">MPT</p>
                        </div>
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
                <ActivityIcon className="h-4 w-4 text-blue-500" />
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
                recentTransactions.map((tx) => {
                  // Determine icon and color based on activity type
                  let icon = <Clock className="h-3 w-3 text-blue-500" />;
                  let bgColor = 'bg-blue-500/20';
                  
                  if (tx.type === 'REWARD_CLAIMED') {
                    icon = <DollarSign className="h-3 w-3 text-green-500" />;
                    bgColor = 'bg-green-500/20';
                  } else if (tx.type === 'REWARD_ISSUED') {
                    icon = <CheckCircle className="h-3 w-3 text-cyan-500" />;
                    bgColor = 'bg-cyan-500/20';
                  } else if (tx.type === 'PR_MERGED') {
                    icon = <GitPullRequest className="h-3 w-3 text-purple-500" />;
                    bgColor = 'bg-purple-500/20';
                  }
                  
                  return (
                    <div
                      key={tx.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-1.5 rounded-full flex-shrink-0 ${bgColor}`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {tx.title}
                        </p>
                        {tx.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {tx.description}
                          </p>
                        )}
                        {tx.pr_number && (
                          <p className="text-xs text-muted-foreground">
                            PR #{tx.pr_number} • {tx.repo_name}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(tx.timestamp)}
                        </p>
                      </div>
                      {tx.amount > 0 && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-bold">
                            {tx.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">MPT</p>
                        </div>
                      )}
                    </div>
                  );
                })
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
                  <ActivityIcon className="h-4 w-4 text-muted-foreground" />
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

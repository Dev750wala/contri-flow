'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  GitPullRequest, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Github,
  Wallet,
  ArrowUpRight,
  Code,
  Package,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/navbar';
import { useContributorDashboard } from '@/app/hooks/useContributorDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';
import { useAccount } from 'wagmi';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_CLAIM_MESSAGE, CLAIM_REWARD } from '@/app/operations/contributor.operations';
import { toast } from 'sonner';

// Helper function to convert wei (18 decimals) to token units
const fromWei = (amount: string): number => {
  return parseFloat(amount) / Math.pow(10, 18);
};

export default function ContributorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [claimingRewardId, setClaimingRewardId] = React.useState<string | null>(null);
  const [showAllClaims, setShowAllClaims] = React.useState(false);

  const githubId = session?.user?.github_id;

  // Lazy query for fetching claim message
  const [getClaimMessage] = useLazyQuery(GET_CLAIM_MESSAGE);
  
  const [claimRewardMutation] = useMutation(CLAIM_REWARD);
  
  const {
    contributor,
    stats,
    pendingClaims,
    recentContributions,
    repositories,
    loading,
    error,
    isNotContributor,
    refetchRewards,
  } = useContributorDashboard(githubId);

  // Handle claim button click
  const handleClaim = async (rewardId: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet to claim rewards.');
      return;
    }

    setClaimingRewardId(rewardId);

    try {
      // Fetch claim message from backend
      const { data, error } = await getClaimMessage({
        variables: {
          rewardId,
          walletAddress: address,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.getClaimMessage) {
        throw new Error('Failed to get claim message');
      }

      // Parse the JSON response to get the message object
      const messageData = JSON.parse(data.getClaimMessage);

      // Request user to sign the message using EIP-712
      // @ts-ignore - ethereum is injected by wallet
      if (!window.ethereum) {
        throw new Error('No wallet provider found');
      }

      // Request signature using eth_signTypedData_v4
      // @ts-ignore
      const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [address, JSON.stringify(messageData)],
      });

      console.log('Signature:', signature);
      console.log('Message Data:', messageData);

      // Send signature to backend for claim processing
      const { data: claimData, errors: claimErrors } = await claimRewardMutation({
        variables: {
          rewardId,
          signature,
          walletAddress: address,
        },
      });

      if (claimErrors) {
        throw new Error(claimErrors[0]?.message || 'Failed to submit claim');
      }

      toast.success('Claim request submitted! Processing on blockchain...');
      
      // Refetch rewards to update UI
      await refetchRewards();

    } catch (error: any) {
      console.error('Claim error:', error);
      
      // Extract specific error messages
      let errorMessage = 'Failed to process claim. Please try again.';
      
      if (error.message?.includes('InvalidVoucher') || error.message?.includes('invalid voucher')) {
        errorMessage = 'Claim failed: Invalid voucher. This reward may have been created before a system update. Please contact support.';
      } else if (error.message?.includes('AlreadyClaimed') || error.message?.includes('already claimed')) {
        errorMessage = 'This reward has already been claimed.';
      } else if (error.message?.includes('InsufficientBalance') || error.message?.includes('insufficient')) {
        errorMessage = 'Claim failed: Insufficient contract balance. Please contact the organization.';
      } else if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
        errorMessage = 'Transaction cancelled by user.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setClaimingRewardId(null);
    }
  };

  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-950/90 via-indigo-900/40 to-transparent pointer-events-none z-0" />
        <Navbar />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show onboarding message if user is not a contributor yet
  if (isNotContributor) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-950/90 via-indigo-900/40 to-transparent pointer-events-none z-0" />
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-28 relative z-10">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-purple-500/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                  <Code className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-2xl">Welcome to ContriFlow!</CardTitle>
                <CardDescription className="text-base mt-2">
                  You're not a contributor yet. Start earning rewards for your open source contributions!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-purple-500" />
                    How to Get Started
                  </h3>
                  <div className="space-y-3 ml-7">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-medium">Find Reward-Enabled Repositories</p>
                        <p className="text-sm text-muted-foreground">
                          Browse repositories that have ContriFlow rewards enabled
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-medium">Make Contributions</p>
                        <p className="text-sm text-muted-foreground">
                          Submit pull requests and help improve the projects
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-medium">Get Rewarded</p>
                        <p className="text-sm text-muted-foreground">
                          Once your PR is merged, you'll receive token rewards that you can claim
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Coins className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-sm font-medium">Earn Tokens</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get rewarded for quality contributions
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <GitPullRequest className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium">Track PRs</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monitor your contribution history
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <Wallet className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
                    <p className="text-sm font-medium">Claim Rewards</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Withdraw your earnings anytime
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button className="flex-1" size="lg">
                    <Github className="h-4 w-4 mr-2" />
                    Browse Repositories
                  </Button>
                  <Button variant="outline" className="flex-1" size="lg">
                    <Package className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Your contributor profile will be created automatically when you receive your first reward from a merged pull request.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-950/90 via-indigo-900/40 to-transparent pointer-events-none z-0" />
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-28 relative z-10">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load dashboard data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Gradient background for navbar visibility */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-950/90 via-indigo-900/40 to-transparent pointer-events-none z-0" />
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-28 relative z-10">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Contributor Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Track your contributions and rewards
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push('/get-started')}>
              <Package className="h-4 w-4 mr-2" />
              Switch to Owner
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Earnings
                  </CardTitle>
                  <Coins className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalEarnings.toFixed(2)} MPT
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalClaimed.toFixed(2)} MPT claimed
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Merged PRs
                  </CardTitle>
                  <GitPullRequest className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.mergedPRs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Rewarded contributions
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending Claims
                  </CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingClaims}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingAmount.toFixed(2)} MPT ready
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Repositories
                  </CardTitle>
                  <Github className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.repositories}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Contributing to
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Recent Activity & Rewards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Claims */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        Pending Claims
                      </CardTitle>
                      <CardDescription>
                        Rewards ready to be claimed
                      </CardDescription>
                    </div>
                    {pendingClaims.length > 0 && (
                      <Badge variant="secondary">{pendingClaims.length}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {pendingClaims.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No pending claims</p>
                      <p className="text-xs mt-2">
                        Your rewards will appear here once PRs are merged
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(showAllClaims ? pendingClaims : pendingClaims.slice(0, 5)).map((claim: any) => (
                        <div
                          key={claim.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Github className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {claim.repository?.organization?.name}/
                                {claim.repository?.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                PR #{claim.pr_number}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {claim.comment}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(claim.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <div className="text-right">
                              <p className="font-bold text-primary">
                                {fromWei(claim.token_amount).toFixed(2)} MPT
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="default"
                              disabled={!isConnected || claimingRewardId === claim.id}
                              onClick={() => handleClaim(claim.id)}
                            >
                              <Wallet className="h-3 w-3 mr-1" />
                              {claimingRewardId === claim.id ? 'Processing...' : 'Claim'}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingClaims.length > 5 && (
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          size="sm"
                          onClick={() => setShowAllClaims(!showAllClaims)}
                        >
                          {showAllClaims ? 'Show Less' : `View All ${pendingClaims.length} Claims`}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitPullRequest className="h-5 w-5 text-green-500" />
                    Recent Contributions
                  </CardTitle>
                  <CardDescription>
                    Your latest rewarded pull requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentContributions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No contributions yet</p>
                      <p className="text-xs mt-2">
                        Start contributing to repositories with rewards enabled
                      </p>
                      <Button className="mt-4" variant="outline">
                        <Github className="h-4 w-4 mr-2" />
                        Browse Repositories
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentContributions.map((contribution: any) => (
                        <div
                          key={contribution.id}
                          className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Github className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">
                                {contribution.repository?.organization?.name}/
                                {contribution.repository?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={
                                  contribution.claimed
                                    ? 'default'
                                    : contribution.confirmed
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className="text-xs"
                              >
                                PR #{contribution.pr_number}
                              </Badge>
                              {contribution.claimed && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Claimed
                                </Badge>
                              )}
                              {contribution.confirmed && !contribution.claimed && (
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Ready to Claim
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {contribution.comment}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(contribution.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-primary text-sm">
                              {fromWei(contribution.token_amount).toFixed(2)} MPT
                            </p>
                            {contribution.payout && (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${contribution.payout.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline inline-flex items-center mt-1"
                              >
                                View TX
                                <ArrowUpRight className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Stats & Actions */}
            <div className="space-y-6">
              {/* Claim History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Claim History
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your past claimed rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentContributions.filter((c: any) => c.claimed).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No claims yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {recentContributions
                        .filter((c: any) => c.claimed)
                        .slice(0, 10)
                        .map((claim: any) => (
                          <div
                            key={claim.id}
                            className="p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium truncate flex-1">
                                {claim.repository?.name}
                              </span>
                              <Badge variant="outline" className="text-xs ml-2">
                                PR #{claim.pr_number}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(claim.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                              <span className="text-xs font-bold text-primary">
                                {fromWei(claim.token_amount).toFixed(2)} MPT
                              </span>
                            </div>
                            {claim.payout && (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${claim.payout.tx_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline inline-flex items-center mt-1"
                              >
                                View TX
                                <ArrowUpRight className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Github className="h-4 w-4 mr-2" />
                    Browse Projects
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <GitPullRequest className="h-4 w-4 mr-2" />
                    View My PRs
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Coins className="h-4 w-4 mr-2" />
                    Claim History
                  </Button>
                </CardContent>
              </Card>

              {/* Getting Started Guide */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">1</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Connect your wallet
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">2</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Browse reward-enabled repositories
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">3</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submit PRs and get rewarded!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

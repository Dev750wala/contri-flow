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
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Navbar from '@/components/navbar';
import { useContributorDashboard } from '@/app/hooks/useContributorDashboard';

export default function ContributorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get GitHub ID from session
  const githubId = session?.user?.github_id;

  // Fetch contributor data using the custom hook
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

  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error && !isNotContributor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Error Loading Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
              <Button onClick={() => refetchRewards()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle new contributor state
  if (isNotContributor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="border-orange-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-orange-500" />
                Welcome, Contributor!
              </CardTitle>
              <CardDescription>
                You haven't received any rewards yet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Start contributing to repositories with rewards enabled to see your dashboard data.
              </p>
              <Button onClick={() => router.push('/get-started')}>
                <Github className="h-4 w-4 mr-2" />
                Browse Repositories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
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
                <div className="text-2xl font-bold">{stats.totalEarnings.toFixed(2)} MPT</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time
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
                      {pendingClaims.slice(0, 5).map((claim: any) => (
                        <div key={claim.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <GitPullRequest className="h-4 w-4 text-green-500" />
                              <span className="font-medium text-sm">
                                PR #{claim.pr_number}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {claim.repository?.name}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {claim.repository?.organization?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-purple-500">
                              {(parseFloat(claim.token_amount) / Math.pow(10, 18)).toFixed(2)} MPT
                            </div>
                            <Button size="sm" variant="outline" className="mt-1">
                              <Wallet className="h-3 w-3 mr-1" />
                              Claim
                            </Button>
                          </div>
                        </div>
                      ))}
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
                        <div key={contribution.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <GitPullRequest className="h-4 w-4 text-green-500" />
                              <span className="font-medium text-sm">
                                PR #{contribution.pr_number}
                              </span>
                              {contribution.claimed && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Claimed
                                </Badge>
                              )}
                              {contribution.confirmed && !contribution.claimed && (
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {contribution.repository?.organization?.name} / {contribution.repository?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm">
                              {(parseFloat(contribution.token_amount) / Math.pow(10, 18)).toFixed(2)} MPT
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(contribution.created_at).toLocaleDateString()}
                            </p>
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
              {/* Wallet Connection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-cyan-500" />
                    Wallet Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Connect your wallet to claim rewards
                    </p>
                    <Button className="w-full" size="sm">
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </Button>
                  </div>
                  {stats.totalClaimed > 0 && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Total Claimed</p>
                      <p className="text-lg font-bold text-green-600">{stats.totalClaimed.toFixed(2)} MPT</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Repositories Contributing To */}
              {repositories.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Github className="h-4 w-4 text-blue-500" />
                      Your Repositories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {repositories.slice(0, 5).map((repo: any) => (
                      <div key={repo.id} className="p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                        <p className="text-sm font-medium">{repo.name}</p>
                        <p className="text-xs text-muted-foreground">{repo.organization?.name}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => refetchRewards()}
                  >
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Refresh Data
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

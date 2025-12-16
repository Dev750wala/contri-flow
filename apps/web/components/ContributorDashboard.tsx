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
import { Progress } from './ui/progress';

import {
  Wallet,
  Github,
  DollarSign,
  GitPullRequest,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Calendar,
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  avatar: string;
  type: 'owner' | 'contributor';
  walletConnected: boolean;
}

interface ContributorDashboardProps {
  user: User;
}

export function ContributorDashboard({ user }: ContributorDashboardProps) {
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  // Mock data
  const availableRewards = [
    {
      id: 'reward1',
      repo: 'awesome-project',
      owner: 'tech-corp',
      amount: 0.5,
      pr: '#124',
      title: 'Add new authentication feature',
      mergedAt: '2 hours ago',
      status: 'ready',
    },
    {
      id: 'reward2',
      repo: 'cool-library',
      owner: 'open-source-org',
      amount: 0.3,
      pr: '#89',
      title: 'Fix memory leak in parser',
      mergedAt: '1 day ago',
      status: 'ready',
    },
    {
      id: 'reward3',
      repo: 'data-tools',
      owner: 'data-company',
      amount: 0.8,
      pr: '#456',
      title: 'Implement new data processing pipeline',
      mergedAt: '3 days ago',
      status: 'pending',
    },
  ];

  const claimedRewards = [
    {
      id: 'claimed1',
      repo: 'web-framework',
      owner: 'framework-team',
      amount: 0.4,
      pr: '#67',
      title: 'Optimize component rendering',
      claimedAt: '1 week ago',
      txHash: '0x123...abc',
    },
    {
      id: 'claimed2',
      repo: 'mobile-sdk',
      owner: 'mobile-inc',
      amount: 0.6,
      pr: '#23',
      title: 'Add iOS support for new API',
      claimedAt: '2 weeks ago',
      txHash: '0x456...def',
    },
    {
      id: 'claimed3',
      repo: 'ai-tools',
      owner: 'ai-startup',
      amount: 1.2,
      pr: '#789',
      title: 'Implement machine learning model optimization',
      claimedAt: '1 month ago',
      txHash: '0x789...ghi',
    },
  ];

  const contributions = [
    { repo: 'awesome-project', prs: 5, totalRewards: 2.1 },
    { repo: 'cool-library', prs: 3, totalRewards: 1.4 },
    { repo: 'web-framework', prs: 2, totalRewards: 0.8 },
    { repo: 'data-tools', prs: 4, totalRewards: 2.8 },
    { repo: 'mobile-sdk', prs: 1, totalRewards: 0.6 },
    { repo: 'ai-tools', prs: 2, totalRewards: 1.8 },
  ];

  const totalAvailable = availableRewards.reduce(
    (sum, reward) => sum + reward.amount,
    0
  );
  const totalClaimed = claimedRewards.reduce(
    (sum, reward) => sum + reward.amount,
    0
  );
  const totalContributions = contributions.reduce(
    (sum, contrib) => sum + contrib.prs,
    0
  );
  const allTimeEarnings = totalClaimed + totalAvailable;

  const handleClaimReward = async (rewardId: string) => {
    setClaimingReward(rewardId);

    // Simulate claiming process
    setTimeout(() => {
      setClaimingReward(null);
      // In a real app, this would update the rewards list
    }, 3000);
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Available Rewards
            </CardTitle>
            <DollarSign className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalAvailable.toFixed(2)} ETH
            </div>
            <p className="text-xs text-slate-300">
              ≈ ${(totalAvailable * 2500).toFixed(0)} USD
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Earned</CardTitle>
            <Wallet className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalClaimed.toFixed(2)} ETH
            </div>
            <p className="text-xs text-slate-300">
              From {claimedRewards.length} contributions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Contributions</CardTitle>
            <GitPullRequest className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalContributions}</div>
            <p className="text-xs text-slate-300">
              Across {contributions.length} repositories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              All-Time Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {allTimeEarnings.toFixed(2)} ETH
            </div>
            <p className="text-xs text-slate-300">
              ≈ ${(allTimeEarnings * 2500).toFixed(0)} USD
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50">
          <TabsTrigger value="available" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-300">
            Available Rewards ({availableRewards.length})
          </TabsTrigger>
          <TabsTrigger value="claimed" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-300">
            Claimed Rewards ({claimedRewards.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-300">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-6">
          {availableRewards.length === 0 ? (
            <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">
                  No available rewards
                </h3>
                <p className="text-slate-300">
                  Keep contributing to earn rewards! Your merged pull requests
                  will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {availableRewards.map((reward) => (
                <Card key={reward.id} className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-slate-600 text-slate-200">
                            {reward.owner}/{reward.repo}
                          </Badge>
                          <Badge variant="secondary" className="bg-slate-800 text-slate-200">{reward.pr}</Badge>
                          {reward.status === 'ready' ? (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ready to Claim
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-500/30 text-orange-300">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending Approval
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold mb-1 text-white">
                          {reward.title}
                        </h3>
                        <p className="text-sm text-slate-300 mb-3">
                          Merged {reward.mergedAt}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Github className="h-4 w-4" />
                            <span>Pull Request {reward.pr}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{reward.mergedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {reward.amount} ETH
                          </p>
                          <p className="text-sm text-slate-300">
                            ≈ ${(reward.amount * 2500).toFixed(0)} USD
                          </p>
                        </div>

                        <Button
                          onClick={() => handleClaimReward(reward.id)}
                          disabled={
                            reward.status !== 'ready' ||
                            claimingReward === reward.id
                          }
                          className="min-w-24"
                        >
                          {claimingReward === reward.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Claiming...
                            </div>
                          ) : reward.status === 'ready' ? (
                            'Claim Reward'
                          ) : (
                            'Pending'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claimed" className="space-y-6">
          <div className="space-y-4">
            {claimedRewards.map((reward) => (
              <Card key={reward.id} className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-slate-600 text-slate-200">
                          {reward.owner}/{reward.repo}
                        </Badge>
                        <Badge variant="secondary" className="bg-slate-800 text-slate-200">{reward.pr}</Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Claimed
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold mb-1 text-white">
                        {reward.title}
                      </h3>
                      <p className="text-sm text-slate-300 mb-3">
                        Claimed {reward.claimedAt}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Github className="h-4 w-4" />
                          <span>Pull Request {reward.pr}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>TX: {reward.txHash}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{reward.amount} ETH</p>
                      <p className="text-sm text-slate-300">
                        ≈ ${(reward.amount * 2500).toFixed(0)} USD
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Contribution Summary */}
          <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Contribution Summary</CardTitle>
              <CardDescription className="text-slate-300">
                Your contributions across different repositories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributions.map((contrib) => (
                  <div
                    key={contrib.repo}
                    className="flex items-center justify-between p-4 border border-slate-700/50 rounded-lg bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5 text-sky-400" />
                      <div>
                        <h4 className="font-medium text-white">{contrib.repo}</h4>
                        <p className="text-sm text-slate-300">
                          {contrib.prs} pull requests merged
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        {contrib.totalRewards.toFixed(1)} ETH
                      </p>
                      <p className="text-sm text-slate-300">
                        ≈ ${(contrib.totalRewards * 2500).toFixed(0)} USD
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievement Badges */}
          <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Achievements</CardTitle>
              <CardDescription className="text-slate-300">
                Badges earned based on your contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border border-slate-700/50 rounded-lg bg-slate-800/40">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="h-6 w-6 text-yellow-400" />
                  </div>
                  <h4 className="font-medium text-white">First Reward</h4>
                  <p className="text-xs text-slate-300">
                    Claimed first ETH reward
                  </p>
                </div>

                <div className="text-center p-4 border border-slate-700/50 rounded-lg bg-slate-800/40">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <GitPullRequest className="h-6 w-6 text-blue-400" />
                  </div>
                  <h4 className="font-medium text-white">10 PRs</h4>
                  <p className="text-xs text-slate-300">
                    10 merged pull requests
                  </p>
                </div>

                <div className="text-center p-4 border border-slate-700/50 rounded-lg bg-slate-800/40">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="h-6 w-6 text-green-400" />
                  </div>
                  <h4 className="font-medium text-white">5 ETH Earned</h4>
                  <p className="text-xs text-slate-300">
                    Earned 5+ ETH total
                  </p>
                </div>

                <div className="text-center p-4 border border-slate-700/50 rounded-lg bg-slate-800/40 opacity-50">
                  <div className="w-12 h-12 bg-slate-700/40 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="h-6 w-6 text-slate-400" />
                  </div>
                  <h4 className="font-medium text-slate-300">Top Contributor</h4>
                  <p className="text-xs text-slate-400">
                    Coming soon...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Earnings Chart */}
          <Card className="bg-slate-900/80 backdrop-blur-lg border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Monthly Earnings</CardTitle>
              <CardDescription className="text-slate-300">
                Your earnings over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { month: 'Jan 2025', amount: 1.2 },
                  { month: 'Dec 2024', amount: 2.1 },
                  { month: 'Nov 2024', amount: 1.8 },
                  { month: 'Oct 2024', amount: 0.9 },
                  { month: 'Sep 2024', amount: 1.5 },
                  { month: 'Aug 2024', amount: 0.7 },
                ].map((month) => (
                  <div key={month.month} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-slate-300">
                      {month.month}
                    </div>
                    <div className="flex-1">
                      <Progress
                        value={(month.amount / 2.5) * 100}
                        className="h-2 bg-slate-800"
                      />
                    </div>
                    <div className="w-20 text-right text-sm font-medium text-white">
                      {month.amount.toFixed(1)} ETH
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

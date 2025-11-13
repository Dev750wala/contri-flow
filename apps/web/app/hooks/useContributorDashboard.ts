import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
  GET_CONTRIBUTOR_DASHBOARD,
  GET_CONTRIBUTOR_REWARDS,
  GET_CONTRIBUTOR_STATS,
} from '@/app/operations';

interface ContributorStats {
  totalEarnings: number;
  mergedPRs: number;
  pendingClaims: number;
  repositories: number;
  totalClaimed: number;
  pendingAmount: number;
}

// Helper function to convert wei (18 decimals) to token units
const fromWei = (amount: string): number => {
  return parseFloat(amount) / Math.pow(10, 18);
};

/**
 * Custom hook to fetch and compute contributor dashboard data
 * @param githubId - The GitHub ID of the contributor
 */
export function useContributorDashboard(githubId: string | null | undefined) {
  // Fetch contributor profile
  const {
    data: contributorData,
    loading: contributorLoading,
    error: contributorError,
  } = useQuery(GET_CONTRIBUTOR_DASHBOARD, {
    variables: { githubId },
    skip: !githubId,
  });

  // Fetch all rewards for the contributor
  const {
    data: rewardsData,
    loading: rewardsLoading,
    error: rewardsError,
    refetch: refetchRewards,
  } = useQuery(GET_CONTRIBUTOR_REWARDS, {
    variables: { githubId },
    skip: !githubId,
  });

  // Compute statistics from rewards data
  const stats: ContributorStats = useMemo(() => {
    if (!rewardsData?.rewardsByContributor) {
      return {
        totalEarnings: 0,
        mergedPRs: 0,
        pendingClaims: 0,
        repositories: 0,
        totalClaimed: 0,
        pendingAmount: 0,
      };
    }

    const rewards = rewardsData.rewardsByContributor;
    const uniqueRepos = new Set(rewards.map((r: any) => r.repository?.id).filter(Boolean));

    // Calculate total earnings (all rewards) - convert from wei
    const totalEarnings = rewards.reduce((sum: number, reward: any) => {
      return sum + fromWei(reward.token_amount || '0');
    }, 0);

    // Calculate total claimed amount - convert from wei
    const totalClaimed = rewards
      .filter((r: any) => r.claimed)
      .reduce((sum: number, reward: any) => {
        return sum + fromWei(reward.token_amount || '0');
      }, 0);

    // Calculate pending claims (confirmed but not claimed) - convert from wei
    const pendingRewards = rewards.filter((r: any) => r.confirmed && !r.claimed);
    const pendingAmount = pendingRewards.reduce((sum: number, reward: any) => {
      return sum + fromWei(reward.token_amount || '0');
    }, 0);

    // Count merged PRs (confirmed rewards)
    const mergedPRs = rewards.filter((r: any) => r.confirmed).length;

    return {
      totalEarnings,
      mergedPRs,
      pendingClaims: pendingRewards.length,
      repositories: uniqueRepos.size,
      totalClaimed,
      pendingAmount,
    };
  }, [rewardsData]);

  // Get pending claims details
  const pendingClaims = useMemo(() => {
    if (!rewardsData?.rewardsByContributor) return [];
    return rewardsData.rewardsByContributor.filter(
      (r: any) => r.confirmed && !r.claimed
    );
  }, [rewardsData]);

  // Get recent contributions (last 10)
  const recentContributions = useMemo(() => {
    if (!rewardsData?.rewardsByContributor) return [];
    return [...rewardsData.rewardsByContributor]
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10);
  }, [rewardsData]);

  // Get unique repositories
  const repositories = useMemo(() => {
    if (!rewardsData?.rewardsByContributor) return [];
    const repoMap = new Map();
    rewardsData.rewardsByContributor.forEach((reward: any) => {
      if (reward.repository) {
        repoMap.set(reward.repository.id, reward.repository);
      }
    });
    return Array.from(repoMap.values());
  }, [rewardsData]);

  const loading = contributorLoading || rewardsLoading;
  const error = contributorError || rewardsError;

  // Check if user is not a contributor yet
  const isNotContributor = 
    !loading && 
    (rewardsError?.message?.includes('Contributor not found') || 
     contributorError?.message?.includes('Contributor not found'));

  return {
    contributor: contributorData?.contributorByGithubId,
    stats,
    pendingClaims,
    recentContributions,
    repositories,
    loading,
    error,
    isNotContributor,
    refetchRewards,
  };
}

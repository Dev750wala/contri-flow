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

const fromWei = (amount: string): number => {
  return parseFloat(amount) / Math.pow(10, 18);
};


export function useContributorDashboard(githubId: string | null | undefined) {
  const {
    data: contributorData,
    loading: contributorLoading,
    error: contributorError,
  } = useQuery(GET_CONTRIBUTOR_DASHBOARD, {
    variables: { githubId },
    skip: !githubId,
  });

  const {
    data: rewardsData,
    loading: rewardsLoading,
    error: rewardsError,
    refetch: refetchRewards,
  } = useQuery(GET_CONTRIBUTOR_REWARDS, {
    variables: { githubId },
    skip: !githubId,
  });

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

    const totalEarnings = rewards.reduce((sum: number, reward: any) => {
      return sum + fromWei(reward.token_amount || '0');
    }, 0);

    const totalClaimed = rewards
      .filter((r: any) => r.claimed)
      .reduce((sum: number, reward: any) => {
        return sum + fromWei(reward.token_amount || '0');
      }, 0);
  
    const pendingRewards = rewards.filter((r: any) => r.confirmed && !r.claimed);
    const pendingAmount = pendingRewards.reduce((sum: number, reward: any) => {
      return sum + fromWei(reward.token_amount || '0');
    }, 0);

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

  const pendingClaims = useMemo(() => {
    if (!rewardsData?.rewardsByContributor) return [];
    return rewardsData.rewardsByContributor
      .filter((r: any) => r.confirmed && !r.claimed)
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [rewardsData]);

  const recentContributions = useMemo(() => {
    if (!rewardsData?.rewardsByContributor) return [];
    return [...rewardsData.rewardsByContributor]
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10);
  }, [rewardsData]);

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

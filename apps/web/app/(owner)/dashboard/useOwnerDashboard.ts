import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  GetOwnerDashboardDocument,
  GetOwnerDashboardQuery,
  GetOrganizationStatsDocument,
  GetOrganizationStatsQuery,
  GetOrganizationActivityDocument,
  GetOrganizationActivityQuery,
  GetPendingRewardsDocument,
  GetPendingRewardsQuery,
  GetGlobalStatsDocument,
  GetGlobalStatsQuery,
  GetRepositoryStatsDocument,
  GetRepositoryStatsQuery,
} from '@/codegen/generated/graphql';

export const useOwnerDashboard = () => {
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);

  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery<GetOwnerDashboardQuery>(GetOwnerDashboardDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: activityData,
    loading: activityLoading,
    error: activityError,
  } = useQuery<GetOrganizationActivityQuery>(GetOrganizationActivityDocument, {
    variables: {
      organizationId: selectedOrgId || '',
      limit: 10,
      offset: 0,
    },
    skip: !selectedOrgId,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: pendingRewardsData,
    loading: pendingRewardsLoading,
    error: pendingRewardsError,
  } = useQuery<GetPendingRewardsQuery>(GetPendingRewardsDocument, {
    variables: {
      organizationId: selectedOrgId || '',
      limit: 5,
      offset: 0,
    },
    skip: !selectedOrgId,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: orgStatsData,
    loading: orgStatsLoading,
    error: orgStatsError,
    refetch: refetchOrgStats,
  } = useQuery<GetOrganizationStatsQuery>(GetOrganizationStatsDocument, {
    variables: {
      organizationId: selectedOrgId || '',
    },
    skip: !selectedOrgId,
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: globalStatsData,
    loading: globalStatsLoading,
    error: globalStatsError,
  } = useQuery<GetGlobalStatsQuery>(GetGlobalStatsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: repoStatsData,
    loading: repoStatsLoading,
    error: repoStatsError,
  } = useQuery<GetRepositoryStatsQuery>(GetRepositoryStatsDocument, {
    variables: {
      repositoryId: selectedRepoId || '',
    },
    skip: !selectedRepoId,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (
      dashboardData?.getOwnerDashboard?.organizations &&
      dashboardData.getOwnerDashboard.organizations.length > 0 &&
      !selectedOrgId
    ) {
      setSelectedOrgId(dashboardData.getOwnerDashboard.organizations[0].id);
    }
  }, [dashboardData, selectedOrgId]);

  const organizations = dashboardData?.getOwnerDashboard?.organizations || [];
  const selectedOrg = organizations.find((org) => org.id === selectedOrgId);
  const activities = activityData?.getOrganizationActivity || [];
  const pendingRewards = pendingRewardsData?.getPendingRewards || [];
  const orgStats = orgStatsData?.getOrganizationStats;
  const globalStats = globalStatsData?.getGlobalStats;
  const repoStats = repoStatsData?.getRepositoryStats;

  const selectOrganization = (orgId: string) => {
    setSelectedOrgId(orgId);
    setSelectedRepoId(null);
  };

  const selectRepository = (repoId: string) => {
    setSelectedRepoId(repoId);
  };

  const refreshData = async () => {
    await refetchDashboard();
    if (selectedOrgId) {
      await refetchOrgStats();
    }
  };

  const allRepositories = organizations.flatMap((org) => org.repositories);
  const activeRepositories = allRepositories.filter(
    (repo) => repo.enabled_rewards && !repo.is_removed
  );

  return {
    
    organizations,
    selectedOrg,
    selectedOrgId,
    selectedRepoId,
    activities,
    pendingRewards,
    orgStats,
    globalStats,
    repoStats,
    allRepositories,
    activeRepositories,

    dashboardLoading,
    activityLoading,
    pendingRewardsLoading,
    orgStatsLoading,
    globalStatsLoading,
    repoStatsLoading,

    dashboardError,
    activityError,
    pendingRewardsError,
    orgStatsError,
    globalStatsError,
    repoStatsError,

    selectOrganization,
    selectRepository,
    refreshData,
  };
};

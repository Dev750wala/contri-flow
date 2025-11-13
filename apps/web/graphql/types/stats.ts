import { objectType } from 'nexus';

export const OrganizationStatsType = objectType({
  name: 'OrganizationStats',
  description: 'Aggregated statistics for an organization (computed from database)',
  definition(t) {
    t.nonNull.float('totalBalance');
    t.nonNull.int('totalRepositories');
    t.nonNull.int('activeRepositories');
    t.nonNull.float('totalRewardsDistributed');
    t.nonNull.int('totalRewardsClaimed');
    t.nonNull.int('totalRewardsPending');
    t.nonNull.float('totalPendingAmount');
    t.nonNull.int('uniqueContributors');
  },
});

export const RepositoryStatsType = objectType({
  name: 'RepositoryStats',
  description: 'Aggregated statistics for a repository (computed from database)',
  definition(t) {
    t.nonNull.int('totalRewards');
    t.nonNull.float('totalDistributed');
    t.nonNull.int('totalPending')
    t.nonNull.float('pendingAmount')
    t.nonNull.int('uniqueContributors')
    t.nonNull.int('maintainerCount')
  },
});

export const GlobalStatsType = objectType({
  name: 'GlobalStats',
  description: 'Global aggregated statistics across all organizations (computed from database)',
  definition(t) {
    t.nonNull.float('totalBalance');
    t.nonNull.int('totalOrganizations');
    t.nonNull.int('totalRepositories');
    t.nonNull.int('totalActiveRepositories');
    t.nonNull.int('totalContributors');
    t.nonNull.float('totalRewardsDistributed');
    t.nonNull.int('totalPendingRewards');
  },
});

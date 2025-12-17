import { gql } from '@apollo/client';

export const GET_OWNER_DASHBOARD = gql`
  query GetOwnerDashboard {
    getOwnerDashboard {
      organizations {
        id
        name
        githubOrgId
        installationId
        appInstalled
        suspended
        ownerGithubId
        createdAt
        updatedAt
        repositories {
          id
          name
          github_repo_id
          enabled_rewards
          is_removed
          created_at
          maintainers {
            id
            github_id
            role
          }
        }
      }
    }
  }
`;

export const GET_ORGANIZATION_DETAILS = gql`
  query GetOrganizationDetails($organizationId: String!) {
    getOrganizationDetails(organizationId: $organizationId) {
      id
      name
      githubOrgId
      installationId
      appInstalled
      suspended
      ownerGithubId
      createdAt
      updatedAt
      repositories {
        id
        name
        github_repo_id
        enabled_rewards
        is_removed
        created_at
        maintainers {
          id
          github_id
          role
        }
      }
    }
  }
`;

export const GET_ORGANIZATION_ACTIVITY = gql`
  query GetOrganizationActivity(
    $organizationId: String!
    $limit: Int
    $offset: Int
  ) {
    getOrganizationActivity(
      organizationId: $organizationId
      limit: $limit
      offset: $offset
    ) {
      id
      activity_type
      title
      description
      repository_id
      reward_id
      actor_id
      actor_name
      amount
      pr_number
      issue_number
      created_at
    }
  }
`;

export const GET_PENDING_REWARDS = gql`
  query GetPendingRewards($organizationId: String!, $limit: Int, $offset: Int) {
    getPendingRewards(
      organizationId: $organizationId
      limit: $limit
      offset: $offset
    ) {
      id
      pr_number
      secret
      token_amount
      claimed
      confirmed
      comment
      created_at
      repository {
        id
        name
      }
      contributor {
        id
        github_id
      }
      issuer {
        id
        github_id
      }
    }
  }
`;

export const GET_REPOSITORY_REWARDS = gql`
  query GetRepositoryRewards(
    $repositoryId: String!
    $limit: Int
    $offset: Int
  ) {
    getRepositoryRewards(
      repositoryId: $repositoryId
      limit: $limit
      offset: $offset
    ) {
      id
      pr_number
      token_amount
      claimed
      confirmed
      comment
      created_at
      contributor {
        github_id
      }
    }
  }
`;

export const GET_ORGANIZATION_STATS = gql`
  query GetOrganizationStats($organizationId: String!) {
    getOrganizationStats(organizationId: $organizationId) {
      totalBalance
      totalRepositories
      activeRepositories
      totalRewardsDistributed
      totalRewardsClaimed
      totalRewardsPending
      totalPendingAmount
      uniqueContributors
    }
  }
`;

export const GET_REPOSITORY_STATS = gql`
  query GetRepositoryStats($repositoryId: String!) {
    getRepositoryStats(repositoryId: $repositoryId) {
      totalRewards
      totalDistributed
      totalPending
      pendingAmount
      uniqueContributors
      maintainerCount
    }
  }
`;

export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    getGlobalStats {
      totalBalance
      totalOrganizations
      totalRepositories
      totalActiveRepositories
      totalContributors
      totalRewardsDistributed
      totalPendingRewards
    }
  }
`;

export const GET_REPOSITORY_STATS_BATCH = gql`
  query GetRepositoryStatsBatch($repositoryIds: [String!]!) {
    getRepositoryStatsBatch(repositoryIds: $repositoryIds) {
      totalRewards
      totalDistributed
      totalPending
      pendingAmount
      uniqueContributors
      maintainerCount
    }
  }
`;

export const LIST_ORGANIZATIONS_FOR_OWNER = gql`
  query ListOrganizationsForOwner {
    listOrganizationsForOwner {
      id
      name
      created_at
    }
  }
`;

export const CHECK_INSTALLATION_QUERY = gql`
  query CheckInstallation($installationId: String!) {
    checkInstallation(installationId: $installationId) {
      error
      data {
        type
        repositories {
          id
          enabled_rewards
          name
          github_repo_id
          maintainers {
            github_id
          }
        }
        organization {
          name
          github_org_id
        }
      }
      success
    }
  }
`;

export const ENABLE_REWARDS_ON_REPOSITORIES = gql`
  mutation EnableRewardsOnRepository($repositoryId: [String!]!) {
    enableRewardsOnRepository(repositoryId: $repositoryId) {
      success
      error
    }
  }
`;

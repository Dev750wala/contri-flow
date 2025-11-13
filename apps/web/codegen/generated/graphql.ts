/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
};

/** Activity log entry for organization events */
export type Activity = {
  __typename?: 'Activity';
  activity_type: ActivityType;
  actor_id?: Maybe<Scalars['String']['output']>;
  actor_name?: Maybe<Scalars['String']['output']>;
  amount?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  issue_number?: Maybe<Scalars['Int']['output']>;
  organization?: Maybe<Organization>;
  pr_number?: Maybe<Scalars['Int']['output']>;
  repository_id?: Maybe<Scalars['String']['output']>;
  reward_id?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export enum ActivityType {
  AppInstalled = 'APP_INSTALLED',
  AppUninstalled = 'APP_UNINSTALLED',
  Deposit = 'DEPOSIT',
  IssueClosed = 'ISSUE_CLOSED',
  IssueCreated = 'ISSUE_CREATED',
  MaintainerAdded = 'MAINTAINER_ADDED',
  MaintainerRemoved = 'MAINTAINER_REMOVED',
  OrgReactivated = 'ORG_REACTIVATED',
  OrgSuspended = 'ORG_SUSPENDED',
  PrMerged = 'PR_MERGED',
  RepoAdded = 'REPO_ADDED',
  RepoRemoved = 'REPO_REMOVED',
  RewardsDisabled = 'REWARDS_DISABLED',
  RewardsEnabled = 'REWARDS_ENABLED',
  RewardClaimed = 'REWARD_CLAIMED',
  RewardIssued = 'REWARD_ISSUED'
}

export type CheckInstallationData = {
  __typename?: 'CheckInstallationData';
  organization?: Maybe<Organization>;
  repositories: Array<Repository>;
  type?: Maybe<Scalars['String']['output']>;
};

export type CheckInstallationResponse = {
  __typename?: 'CheckInstallationResponse';
  data?: Maybe<CheckInstallationData>;
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Contributor = {
  __typename?: 'Contributor';
  created_at: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  github_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  rewards?: Maybe<Array<Maybe<Reward>>>;
  updated_at: Scalars['DateTime']['output'];
  user?: Maybe<User>;
};

/** Global aggregated statistics across all organizations (computed from database) */
export type GlobalStats = {
  __typename?: 'GlobalStats';
  totalActiveRepositories: Scalars['Int']['output'];
  totalBalance: Scalars['Float']['output'];
  totalContributors: Scalars['Int']['output'];
  totalOrganizations: Scalars['Int']['output'];
  totalPendingRewards: Scalars['Int']['output'];
  totalRepositories: Scalars['Int']['output'];
  totalRewardsDistributed: Scalars['Float']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addRepositoryMaintainer: RepositoryMaintainer;
  claimReward?: Maybe<Reward>;
  enableRewardsOnRepository?: Maybe<RepositoryMutationResponse>;
  enableSyncMaintainers?: Maybe<Organization>;
  linkContributorToUser?: Maybe<Contributor>;
  removeRepositoryMaintainer?: Maybe<Scalars['Boolean']['output']>;
};


export type MutationAddRepositoryMaintainerArgs = {
  github_id: Scalars['String']['input'];
  repositoryId: Scalars['String']['input'];
  role: RepositoryRole;
  userId: Scalars['String']['input'];
};


export type MutationClaimRewardArgs = {
  id: Scalars['String']['input'];
};


export type MutationEnableRewardsOnRepositoryArgs = {
  repositoryId: Array<Scalars['String']['input']>;
};


export type MutationEnableSyncMaintainersArgs = {
  organizationId: Scalars['String']['input'];
};


export type MutationLinkContributorToUserArgs = {
  github_id: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRemoveRepositoryMaintainerArgs = {
  id: Scalars['String']['input'];
};

export type Organization = {
  __typename?: 'Organization';
  app_installed: Scalars['Boolean']['output'];
  app_uninstalled_at?: Maybe<Scalars['DateTime']['output']>;
  created_at: Scalars['DateTime']['output'];
  github_org_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  installation_id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  owner: User;
  owner_github_id: Scalars['String']['output'];
  repositories?: Maybe<Array<Maybe<Repository>>>;
  suspended: Scalars['Boolean']['output'];
  sync_maintainers: Scalars['Boolean']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export enum OrganizationRole {
  Member = 'MEMBER',
  Owner = 'OWNER'
}

/** Aggregated statistics for an organization (computed from database) */
export type OrganizationStats = {
  __typename?: 'OrganizationStats';
  activeRepositories: Scalars['Int']['output'];
  totalBalance: Scalars['Float']['output'];
  totalPendingAmount: Scalars['Float']['output'];
  totalRepositories: Scalars['Int']['output'];
  totalRewardsClaimed: Scalars['Int']['output'];
  totalRewardsDistributed: Scalars['Float']['output'];
  totalRewardsPending: Scalars['Int']['output'];
  uniqueContributors: Scalars['Int']['output'];
};

export type OrganizationWithDetails = {
  __typename?: 'OrganizationWithDetails';
  appInstalled: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  githubOrgId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  installationId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  /** Organization owner */
  owner?: Maybe<User>;
  ownerGithubId: Scalars['String']['output'];
  /** All repositories for this organization */
  repositories: Array<Repository>;
  suspended: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Complete dashboard data for organization owner */
export type OwnerDashboardData = {
  __typename?: 'OwnerDashboardData';
  /** List of organizations with basic details (fast) */
  organizations: Array<OrganizationWithDetails>;
};

export type Payout = {
  __typename?: 'Payout';
  claimed_at: Scalars['DateTime']['output'];
  destination_chain: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  platform_fee: Scalars['String']['output'];
  receiver_address: Scalars['String']['output'];
  reward?: Maybe<Reward>;
  total_amount: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  allRepositories?: Maybe<Array<Maybe<Repository>>>;
  allUsers?: Maybe<Array<Maybe<User>>>;
  checkInstallation?: Maybe<CheckInstallationResponse>;
  contributor?: Maybe<Contributor>;
  contributorByGithubId?: Maybe<Contributor>;
  /** Get aggregated statistics across all organizations owned by user (VERY SLOW query) */
  getGlobalStats?: Maybe<GlobalStats>;
  /** Get recent activity logs for an organization (FAST query - indexed) */
  getOrganizationActivity: Array<Activity>;
  /** Get organization details by ID (FAST query) */
  getOrganizationDetails?: Maybe<OrganizationWithDetails>;
  /** Get aggregated statistics for an organization (SLOW query - use separately) */
  getOrganizationStats?: Maybe<OrganizationStats>;
  /** Get all organizations owned by the current user (FAST query) */
  getOwnerDashboard?: Maybe<OwnerDashboardData>;
  /** Get pending (unclaimed but confirmed) rewards for an organization (FAST query) */
  getPendingRewards: Array<Reward>;
  /** Get all rewards for a repository (FAST query) */
  getRepositoryRewards: Array<Reward>;
  /** Get aggregated statistics for a repository (SLOW query - use separately) */
  getRepositoryStats?: Maybe<RepositoryStats>;
  /** Get stats for multiple repositories at once (SLOW query) */
  getRepositoryStatsBatch: Array<RepositoryStats>;
  listOrganizationsForOwner?: Maybe<Array<Maybe<Organization>>>;
  me?: Maybe<User>;
  organization?: Maybe<Organization>;
  organizationByGithubId?: Maybe<Organization>;
  organizations?: Maybe<Array<Maybe<Organization>>>;
  repositoriesByOrganizationId?: Maybe<Array<Maybe<Repository>>>;
  repository?: Maybe<Repository>;
  repositoryByGithubRepoId?: Maybe<Repository>;
  repositoryMaintainers: Array<RepositoryMaintainer>;
  reward?: Maybe<Reward>;
  rewardsByContributor: Array<Reward>;
  rewardsByRepository: Array<Reward>;
  user?: Maybe<User>;
  userByEmail?: Maybe<User>;
  userByGithubId?: Maybe<User>;
};


export type QueryAllRepositoriesArgs = {
  token: Scalars['String']['input'];
};


export type QueryAllUsersArgs = {
  token: Scalars['String']['input'];
};


export type QueryCheckInstallationArgs = {
  installationId: Scalars['String']['input'];
};


export type QueryContributorArgs = {
  id: Scalars['String']['input'];
};


export type QueryContributorByGithubIdArgs = {
  github_id: Scalars['String']['input'];
};


export type QueryGetOrganizationActivityArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  organizationId: Scalars['String']['input'];
};


export type QueryGetOrganizationDetailsArgs = {
  organizationId: Scalars['String']['input'];
};


export type QueryGetOrganizationStatsArgs = {
  organizationId: Scalars['String']['input'];
};


export type QueryGetPendingRewardsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  organizationId: Scalars['String']['input'];
};


export type QueryGetRepositoryRewardsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  repositoryId: Scalars['String']['input'];
};


export type QueryGetRepositoryStatsArgs = {
  repositoryId: Scalars['String']['input'];
};


export type QueryGetRepositoryStatsBatchArgs = {
  repositoryIds: Array<Scalars['String']['input']>;
};


export type QueryOrganizationArgs = {
  id: Scalars['String']['input'];
};


export type QueryOrganizationByGithubIdArgs = {
  githubOrgId: Scalars['String']['input'];
};


export type QueryRepositoriesByOrganizationIdArgs = {
  organizationId: Scalars['String']['input'];
};


export type QueryRepositoryArgs = {
  id: Scalars['String']['input'];
};


export type QueryRepositoryByGithubRepoIdArgs = {
  githubRepoId: Scalars['String']['input'];
};


export type QueryRepositoryMaintainersArgs = {
  repositoryId: Scalars['String']['input'];
};


export type QueryRewardArgs = {
  id: Scalars['String']['input'];
};


export type QueryRewardsByContributorArgs = {
  contributorGithubId: Scalars['String']['input'];
};


export type QueryRewardsByRepositoryArgs = {
  repoGithubId: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};


export type QueryUserByEmailArgs = {
  email: Scalars['String']['input'];
};


export type QueryUserByGithubIdArgs = {
  github_id: Scalars['String']['input'];
};

export type Repository = {
  __typename?: 'Repository';
  created_at: Scalars['DateTime']['output'];
  enabled_rewards: Scalars['Boolean']['output'];
  github_repo_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  is_removed: Scalars['Boolean']['output'];
  maintainers: Array<RepositoryMaintainer>;
  name: Scalars['String']['output'];
  organization?: Maybe<Organization>;
  removed_at?: Maybe<Scalars['DateTime']['output']>;
  rewards?: Maybe<Array<Maybe<Reward>>>;
  updated_at: Scalars['DateTime']['output'];
};

export type RepositoryMaintainer = {
  __typename?: 'RepositoryMaintainer';
  created_at: Scalars['DateTime']['output'];
  github_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  issued_rewards?: Maybe<Array<Maybe<Reward>>>;
  repository: Repository;
  role: RepositoryRole;
  user?: Maybe<User>;
};

export type RepositoryMutationResponse = {
  __typename?: 'RepositoryMutationResponse';
  error?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export enum RepositoryRole {
  Admin = 'ADMIN',
  Maintain = 'MAINTAIN'
}

/** Aggregated statistics for a repository (computed from database) */
export type RepositoryStats = {
  __typename?: 'RepositoryStats';
  maintainerCount: Scalars['Int']['output'];
  pendingAmount: Scalars['Float']['output'];
  totalDistributed: Scalars['Float']['output'];
  totalPending: Scalars['Int']['output'];
  totalRewards: Scalars['Int']['output'];
  uniqueContributors: Scalars['Int']['output'];
};

export type Reward = {
  __typename?: 'Reward';
  claimed: Scalars['Boolean']['output'];
  comment: Scalars['String']['output'];
  confirmed: Scalars['Boolean']['output'];
  contributor?: Maybe<Contributor>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  issuer: RepositoryMaintainer;
  payout?: Maybe<Payout>;
  pr_number: Scalars['Int']['output'];
  repository?: Maybe<Repository>;
  secret: Scalars['String']['output'];
  token_amount: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type User = {
  __typename?: 'User';
  contributor?: Maybe<Array<Maybe<Contributor>>>;
  created_at: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  github_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  maintenances?: Maybe<Array<Maybe<RepositoryMaintainer>>>;
  name: Scalars['String']['output'];
  organizations?: Maybe<Array<Maybe<Organization>>>;
  updated_at: Scalars['DateTime']['output'];
};

export type GetOwnerDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GetOwnerDashboardQuery = { __typename?: 'Query', getOwnerDashboard?: { __typename?: 'OwnerDashboardData', organizations: Array<{ __typename?: 'OrganizationWithDetails', id: string, name: string, githubOrgId: string, installationId: string, appInstalled: boolean, suspended: boolean, ownerGithubId: string, createdAt: any, updatedAt: any, repositories: Array<{ __typename?: 'Repository', id: string, name: string, github_repo_id: string, enabled_rewards: boolean, is_removed: boolean, created_at: any, maintainers: Array<{ __typename?: 'RepositoryMaintainer', id: string, github_id: string, role: RepositoryRole }> }> }> } | null };

export type GetOrganizationDetailsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type GetOrganizationDetailsQuery = { __typename?: 'Query', getOrganizationDetails?: { __typename?: 'OrganizationWithDetails', id: string, name: string, githubOrgId: string, installationId: string, appInstalled: boolean, suspended: boolean, ownerGithubId: string, createdAt: any, updatedAt: any, repositories: Array<{ __typename?: 'Repository', id: string, name: string, github_repo_id: string, enabled_rewards: boolean, is_removed: boolean, created_at: any, maintainers: Array<{ __typename?: 'RepositoryMaintainer', id: string, github_id: string, role: RepositoryRole }> }> } | null };

export type GetOrganizationActivityQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetOrganizationActivityQuery = { __typename?: 'Query', getOrganizationActivity: Array<{ __typename?: 'Activity', id: string, activity_type: ActivityType, title: string, description?: string | null, repository_id?: string | null, reward_id?: string | null, actor_id?: string | null, actor_name?: string | null, amount?: string | null, pr_number?: number | null, issue_number?: number | null, created_at: any }> };

export type GetPendingRewardsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPendingRewardsQuery = { __typename?: 'Query', getPendingRewards: Array<{ __typename?: 'Reward', id: string, pr_number: number, secret: string, token_amount: string, claimed: boolean, confirmed: boolean, comment: string, created_at: any, repository?: { __typename?: 'Repository', id: string, name: string } | null, contributor?: { __typename?: 'Contributor', id: string, github_id: string } | null, issuer: { __typename?: 'RepositoryMaintainer', id: string, github_id: string } }> };

export type GetRepositoryRewardsQueryVariables = Exact<{
  repositoryId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRepositoryRewardsQuery = { __typename?: 'Query', getRepositoryRewards: Array<{ __typename?: 'Reward', id: string, pr_number: number, token_amount: string, claimed: boolean, confirmed: boolean, comment: string, created_at: any, contributor?: { __typename?: 'Contributor', github_id: string } | null }> };

export type GetOrganizationStatsQueryVariables = Exact<{
  organizationId: Scalars['String']['input'];
}>;


export type GetOrganizationStatsQuery = { __typename?: 'Query', getOrganizationStats?: { __typename?: 'OrganizationStats', totalBalance: number, totalRepositories: number, activeRepositories: number, totalRewardsDistributed: number, totalRewardsClaimed: number, totalRewardsPending: number, totalPendingAmount: number, uniqueContributors: number } | null };

export type GetRepositoryStatsQueryVariables = Exact<{
  repositoryId: Scalars['String']['input'];
}>;


export type GetRepositoryStatsQuery = { __typename?: 'Query', getRepositoryStats?: { __typename?: 'RepositoryStats', totalRewards: number, totalDistributed: number, totalPending: number, pendingAmount: number, uniqueContributors: number, maintainerCount: number } | null };

export type GetGlobalStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGlobalStatsQuery = { __typename?: 'Query', getGlobalStats?: { __typename?: 'GlobalStats', totalBalance: number, totalOrganizations: number, totalRepositories: number, totalActiveRepositories: number, totalContributors: number, totalRewardsDistributed: number, totalPendingRewards: number } | null };

export type GetRepositoryStatsBatchQueryVariables = Exact<{
  repositoryIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetRepositoryStatsBatchQuery = { __typename?: 'Query', getRepositoryStatsBatch: Array<{ __typename?: 'RepositoryStats', totalRewards: number, totalDistributed: number, totalPending: number, pendingAmount: number, uniqueContributors: number, maintainerCount: number }> };

export type ListOrganizationsForOwnerQueryVariables = Exact<{ [key: string]: never; }>;


export type ListOrganizationsForOwnerQuery = { __typename?: 'Query', listOrganizationsForOwner?: Array<{ __typename?: 'Organization', id: string, name: string, created_at: any } | null> | null };

export type CheckInstallationQueryVariables = Exact<{
  installationId: Scalars['String']['input'];
}>;


export type CheckInstallationQuery = { __typename?: 'Query', checkInstallation?: { __typename?: 'CheckInstallationResponse', error?: string | null, success: boolean, data?: { __typename?: 'CheckInstallationData', type?: string | null, repositories: Array<{ __typename?: 'Repository', id: string, enabled_rewards: boolean, name: string, github_repo_id: string, maintainers: Array<{ __typename?: 'RepositoryMaintainer', github_id: string }> }>, organization?: { __typename?: 'Organization', name: string, github_org_id: string } | null } | null } | null };

export type EnableRewardsOnRepositoryMutationVariables = Exact<{
  repositoryId: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type EnableRewardsOnRepositoryMutation = { __typename?: 'Mutation', enableRewardsOnRepository?: { __typename?: 'RepositoryMutationResponse', success: boolean, error?: string | null } | null };


export const GetOwnerDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOwnerDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOwnerDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organizations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"githubOrgId"}},{"kind":"Field","name":{"kind":"Name","value":"installationId"}},{"kind":"Field","name":{"kind":"Name","value":"appInstalled"}},{"kind":"Field","name":{"kind":"Name","value":"suspended"}},{"kind":"Field","name":{"kind":"Name","value":"ownerGithubId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"repositories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"github_repo_id"}},{"kind":"Field","name":{"kind":"Name","value":"enabled_rewards"}},{"kind":"Field","name":{"kind":"Name","value":"is_removed"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"maintainers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"github_id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetOwnerDashboardQuery, GetOwnerDashboardQueryVariables>;
export const GetOrganizationDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizationDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOrganizationDetails"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"githubOrgId"}},{"kind":"Field","name":{"kind":"Name","value":"installationId"}},{"kind":"Field","name":{"kind":"Name","value":"appInstalled"}},{"kind":"Field","name":{"kind":"Name","value":"suspended"}},{"kind":"Field","name":{"kind":"Name","value":"ownerGithubId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"repositories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"github_repo_id"}},{"kind":"Field","name":{"kind":"Name","value":"enabled_rewards"}},{"kind":"Field","name":{"kind":"Name","value":"is_removed"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"maintainers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"github_id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetOrganizationDetailsQuery, GetOrganizationDetailsQueryVariables>;
export const GetOrganizationActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizationActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOrganizationActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"activity_type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"repository_id"}},{"kind":"Field","name":{"kind":"Name","value":"reward_id"}},{"kind":"Field","name":{"kind":"Name","value":"actor_id"}},{"kind":"Field","name":{"kind":"Name","value":"actor_name"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"pr_number"}},{"kind":"Field","name":{"kind":"Name","value":"issue_number"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<GetOrganizationActivityQuery, GetOrganizationActivityQueryVariables>;
export const GetPendingRewardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPendingRewards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getPendingRewards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pr_number"}},{"kind":"Field","name":{"kind":"Name","value":"secret"}},{"kind":"Field","name":{"kind":"Name","value":"token_amount"}},{"kind":"Field","name":{"kind":"Name","value":"claimed"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"repository"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"contributor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"github_id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"issuer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"github_id"}}]}}]}}]}}]} as unknown as DocumentNode<GetPendingRewardsQuery, GetPendingRewardsQueryVariables>;
export const GetRepositoryRewardsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRepositoryRewards"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repositoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getRepositoryRewards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"repositoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repositoryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pr_number"}},{"kind":"Field","name":{"kind":"Name","value":"token_amount"}},{"kind":"Field","name":{"kind":"Name","value":"claimed"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"contributor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github_id"}}]}}]}}]}}]} as unknown as DocumentNode<GetRepositoryRewardsQuery, GetRepositoryRewardsQueryVariables>;
export const GetOrganizationStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrganizationStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getOrganizationStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"organizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"organizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalBalance"}},{"kind":"Field","name":{"kind":"Name","value":"totalRepositories"}},{"kind":"Field","name":{"kind":"Name","value":"activeRepositories"}},{"kind":"Field","name":{"kind":"Name","value":"totalRewardsDistributed"}},{"kind":"Field","name":{"kind":"Name","value":"totalRewardsClaimed"}},{"kind":"Field","name":{"kind":"Name","value":"totalRewardsPending"}},{"kind":"Field","name":{"kind":"Name","value":"totalPendingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"uniqueContributors"}}]}}]}}]} as unknown as DocumentNode<GetOrganizationStatsQuery, GetOrganizationStatsQueryVariables>;
export const GetRepositoryStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRepositoryStats"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repositoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getRepositoryStats"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"repositoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repositoryId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRewards"}},{"kind":"Field","name":{"kind":"Name","value":"totalDistributed"}},{"kind":"Field","name":{"kind":"Name","value":"totalPending"}},{"kind":"Field","name":{"kind":"Name","value":"pendingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"uniqueContributors"}},{"kind":"Field","name":{"kind":"Name","value":"maintainerCount"}}]}}]}}]} as unknown as DocumentNode<GetRepositoryStatsQuery, GetRepositoryStatsQueryVariables>;
export const GetGlobalStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGlobalStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getGlobalStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalBalance"}},{"kind":"Field","name":{"kind":"Name","value":"totalOrganizations"}},{"kind":"Field","name":{"kind":"Name","value":"totalRepositories"}},{"kind":"Field","name":{"kind":"Name","value":"totalActiveRepositories"}},{"kind":"Field","name":{"kind":"Name","value":"totalContributors"}},{"kind":"Field","name":{"kind":"Name","value":"totalRewardsDistributed"}},{"kind":"Field","name":{"kind":"Name","value":"totalPendingRewards"}}]}}]}}]} as unknown as DocumentNode<GetGlobalStatsQuery, GetGlobalStatsQueryVariables>;
export const GetRepositoryStatsBatchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRepositoryStatsBatch"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repositoryIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getRepositoryStatsBatch"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"repositoryIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repositoryIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalRewards"}},{"kind":"Field","name":{"kind":"Name","value":"totalDistributed"}},{"kind":"Field","name":{"kind":"Name","value":"totalPending"}},{"kind":"Field","name":{"kind":"Name","value":"pendingAmount"}},{"kind":"Field","name":{"kind":"Name","value":"uniqueContributors"}},{"kind":"Field","name":{"kind":"Name","value":"maintainerCount"}}]}}]}}]} as unknown as DocumentNode<GetRepositoryStatsBatchQuery, GetRepositoryStatsBatchQueryVariables>;
export const ListOrganizationsForOwnerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListOrganizationsForOwner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listOrganizationsForOwner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<ListOrganizationsForOwnerQuery, ListOrganizationsForOwnerQueryVariables>;
export const CheckInstallationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckInstallation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"installationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkInstallation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"installationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"installationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"repositories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"enabled_rewards"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"github_repo_id"}},{"kind":"Field","name":{"kind":"Name","value":"maintainers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"github_id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"github_org_id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"success"}}]}}]}}]} as unknown as DocumentNode<CheckInstallationQuery, CheckInstallationQueryVariables>;
export const EnableRewardsOnRepositoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnableRewardsOnRepository"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"repositoryId"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enableRewardsOnRepository"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"repositoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"repositoryId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<EnableRewardsOnRepositoryMutation, EnableRewardsOnRepositoryMutationVariables>;
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

export type Contributor = {
  __typename?: 'Contributor';
  created_at: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  github_id: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  rewards?: Maybe<Array<Maybe<Reward>>>;
  updated_at: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  wallet_address?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addRepositoryMaintainer: RepositoryMaintainer;
  claimReward?: Maybe<Reward>;
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

export type Query = {
  __typename?: 'Query';
  allRepositories?: Maybe<Array<Maybe<Repository>>>;
  allUsers?: Maybe<Array<Maybe<User>>>;
  contributor?: Maybe<Contributor>;
  contributorByGithubId?: Maybe<Contributor>;
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


export type QueryContributorArgs = {
  id: Scalars['String']['input'];
};


export type QueryContributorByGithubIdArgs = {
  github_id: Scalars['String']['input'];
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

export enum RepositoryRole {
  Admin = 'ADMIN',
  Maintain = 'MAINTAIN'
}

export type Reward = {
  __typename?: 'Reward';
  claimed: Scalars['Boolean']['output'];
  claimed_at?: Maybe<Scalars['DateTime']['output']>;
  comment: Scalars['String']['output'];
  contributor?: Maybe<Contributor>;
  created_at: Scalars['DateTime']['output'];
  destination_address?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  issuer: RepositoryMaintainer;
  pr_number: Scalars['Int']['output'];
  repository?: Maybe<Repository>;
  secret: Scalars['String']['output'];
  tx_hash?: Maybe<Scalars['String']['output']>;
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
  wallet_address?: Maybe<Scalars['String']['output']>;
};

export type ListOrganizationsForOwnerQueryVariables = Exact<{ [key: string]: never; }>;


export type ListOrganizationsForOwnerQuery = { __typename?: 'Query', listOrganizationsForOwner?: Array<{ __typename?: 'Organization', id: string, name: string, created_at: any } | null> | null };


export const ListOrganizationsForOwnerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListOrganizationsForOwner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listOrganizationsForOwner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<ListOrganizationsForOwnerQuery, ListOrganizationsForOwnerQueryVariables>;
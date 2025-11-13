/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetOwnerDashboard {\n    getOwnerDashboard {\n      organizations {\n        id\n        name\n        githubOrgId\n        installationId\n        appInstalled\n        suspended\n        ownerGithubId\n        createdAt\n        updatedAt\n        repositories {\n          id\n          name\n          github_repo_id\n          enabled_rewards\n          is_removed\n          created_at\n          maintainers {\n            id\n            github_id\n            role\n          }\n        }\n      }\n    }\n  }\n": typeof types.GetOwnerDashboardDocument,
    "\n  query GetOrganizationDetails($organizationId: String!) {\n    getOrganizationDetails(organizationId: $organizationId) {\n      id\n      name\n      githubOrgId\n      installationId\n      appInstalled\n      suspended\n      ownerGithubId\n      createdAt\n      updatedAt\n      repositories {\n        id\n        name\n        github_repo_id\n        enabled_rewards\n        is_removed\n        created_at\n        maintainers {\n          id\n          github_id\n          role\n        }\n      }\n    }\n  }\n": typeof types.GetOrganizationDetailsDocument,
    "\n  query GetOrganizationActivity(\n    $organizationId: String!\n    $limit: Int\n    $offset: Int\n  ) {\n    getOrganizationActivity(\n      organizationId: $organizationId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      activity_type\n      title\n      description\n      repository_id\n      reward_id\n      actor_id\n      actor_name\n      amount\n      pr_number\n      issue_number\n      created_at\n    }\n  }\n": typeof types.GetOrganizationActivityDocument,
    "\n  query GetPendingRewards($organizationId: String!, $limit: Int, $offset: Int) {\n    getPendingRewards(\n      organizationId: $organizationId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      pr_number\n      secret\n      token_amount\n      claimed\n      confirmed\n      comment\n      created_at\n      repository {\n        id\n        name\n      }\n      contributor {\n        id\n        github_id\n      }\n      issuer {\n        id\n        github_id\n      }\n    }\n  }\n": typeof types.GetPendingRewardsDocument,
    "\n  query GetRepositoryRewards(\n    $repositoryId: String!\n    $limit: Int\n    $offset: Int\n  ) {\n    getRepositoryRewards(\n      repositoryId: $repositoryId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      pr_number\n      token_amount\n      claimed\n      confirmed\n      comment\n      created_at\n      contributor {\n        github_id\n      }\n    }\n  }\n": typeof types.GetRepositoryRewardsDocument,
    "\n  query GetOrganizationStats($organizationId: String!) {\n    getOrganizationStats(organizationId: $organizationId) {\n      totalBalance\n      totalRepositories\n      activeRepositories\n      totalRewardsDistributed\n      totalRewardsClaimed\n      totalRewardsPending\n      totalPendingAmount\n      uniqueContributors\n    }\n  }\n": typeof types.GetOrganizationStatsDocument,
    "\n  query GetRepositoryStats($repositoryId: String!) {\n    getRepositoryStats(repositoryId: $repositoryId) {\n      totalRewards\n      totalDistributed\n      totalPending\n      pendingAmount\n      uniqueContributors\n      maintainerCount\n    }\n  }\n": typeof types.GetRepositoryStatsDocument,
    "\n  query GetGlobalStats {\n    getGlobalStats {\n      totalBalance\n      totalOrganizations\n      totalRepositories\n      totalActiveRepositories\n      totalContributors\n      totalRewardsDistributed\n      totalPendingRewards\n    }\n  }\n": typeof types.GetGlobalStatsDocument,
    "\n  query GetRepositoryStatsBatch($repositoryIds: [String!]!) {\n    getRepositoryStatsBatch(repositoryIds: $repositoryIds) {\n      totalRewards\n      totalDistributed\n      totalPending\n      pendingAmount\n      uniqueContributors\n      maintainerCount\n    }\n  }\n": typeof types.GetRepositoryStatsBatchDocument,
    "\n  query ListOrganizationsForOwner {\n    listOrganizationsForOwner {\n      id\n      name\n      created_at\n    }\n  }\n": typeof types.ListOrganizationsForOwnerDocument,
    "\n  query CheckInstallation($installationId: String!) {\n    checkInstallation(installationId: $installationId) {\n      error\n      data {\n        type\n        repositories {\n          id\n          enabled_rewards\n          name\n          github_repo_id\n          maintainers {\n            github_id\n          }\n        }\n        organization {\n          name\n          github_org_id\n        }\n      }\n      success\n    }\n  }\n": typeof types.CheckInstallationDocument,
    "\n  mutation EnableRewardsOnRepository($repositoryId: [String!]!) {\n    enableRewardsOnRepository(repositoryId: $repositoryId) {\n      success\n      error\n    }\n  }\n": typeof types.EnableRewardsOnRepositoryDocument,
    "\n  query ListOrganizationsForOwner {\n      listOrganizationsForOwner {\n          id\n          name\n          created_at\n      }\n  }\n": typeof types.ListOrganizationsForOwnerDocument,
};
const documents: Documents = {
    "\n  query GetOwnerDashboard {\n    getOwnerDashboard {\n      organizations {\n        id\n        name\n        githubOrgId\n        installationId\n        appInstalled\n        suspended\n        ownerGithubId\n        createdAt\n        updatedAt\n        repositories {\n          id\n          name\n          github_repo_id\n          enabled_rewards\n          is_removed\n          created_at\n          maintainers {\n            id\n            github_id\n            role\n          }\n        }\n      }\n    }\n  }\n": types.GetOwnerDashboardDocument,
    "\n  query GetOrganizationDetails($organizationId: String!) {\n    getOrganizationDetails(organizationId: $organizationId) {\n      id\n      name\n      githubOrgId\n      installationId\n      appInstalled\n      suspended\n      ownerGithubId\n      createdAt\n      updatedAt\n      repositories {\n        id\n        name\n        github_repo_id\n        enabled_rewards\n        is_removed\n        created_at\n        maintainers {\n          id\n          github_id\n          role\n        }\n      }\n    }\n  }\n": types.GetOrganizationDetailsDocument,
    "\n  query GetOrganizationActivity(\n    $organizationId: String!\n    $limit: Int\n    $offset: Int\n  ) {\n    getOrganizationActivity(\n      organizationId: $organizationId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      activity_type\n      title\n      description\n      repository_id\n      reward_id\n      actor_id\n      actor_name\n      amount\n      pr_number\n      issue_number\n      created_at\n    }\n  }\n": types.GetOrganizationActivityDocument,
    "\n  query GetPendingRewards($organizationId: String!, $limit: Int, $offset: Int) {\n    getPendingRewards(\n      organizationId: $organizationId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      pr_number\n      secret\n      token_amount\n      claimed\n      confirmed\n      comment\n      created_at\n      repository {\n        id\n        name\n      }\n      contributor {\n        id\n        github_id\n      }\n      issuer {\n        id\n        github_id\n      }\n    }\n  }\n": types.GetPendingRewardsDocument,
    "\n  query GetRepositoryRewards(\n    $repositoryId: String!\n    $limit: Int\n    $offset: Int\n  ) {\n    getRepositoryRewards(\n      repositoryId: $repositoryId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      pr_number\n      token_amount\n      claimed\n      confirmed\n      comment\n      created_at\n      contributor {\n        github_id\n      }\n    }\n  }\n": types.GetRepositoryRewardsDocument,
    "\n  query GetOrganizationStats($organizationId: String!) {\n    getOrganizationStats(organizationId: $organizationId) {\n      totalBalance\n      totalRepositories\n      activeRepositories\n      totalRewardsDistributed\n      totalRewardsClaimed\n      totalRewardsPending\n      totalPendingAmount\n      uniqueContributors\n    }\n  }\n": types.GetOrganizationStatsDocument,
    "\n  query GetRepositoryStats($repositoryId: String!) {\n    getRepositoryStats(repositoryId: $repositoryId) {\n      totalRewards\n      totalDistributed\n      totalPending\n      pendingAmount\n      uniqueContributors\n      maintainerCount\n    }\n  }\n": types.GetRepositoryStatsDocument,
    "\n  query GetGlobalStats {\n    getGlobalStats {\n      totalBalance\n      totalOrganizations\n      totalRepositories\n      totalActiveRepositories\n      totalContributors\n      totalRewardsDistributed\n      totalPendingRewards\n    }\n  }\n": types.GetGlobalStatsDocument,
    "\n  query GetRepositoryStatsBatch($repositoryIds: [String!]!) {\n    getRepositoryStatsBatch(repositoryIds: $repositoryIds) {\n      totalRewards\n      totalDistributed\n      totalPending\n      pendingAmount\n      uniqueContributors\n      maintainerCount\n    }\n  }\n": types.GetRepositoryStatsBatchDocument,
    "\n  query ListOrganizationsForOwner {\n    listOrganizationsForOwner {\n      id\n      name\n      created_at\n    }\n  }\n": types.ListOrganizationsForOwnerDocument,
    "\n  query CheckInstallation($installationId: String!) {\n    checkInstallation(installationId: $installationId) {\n      error\n      data {\n        type\n        repositories {\n          id\n          enabled_rewards\n          name\n          github_repo_id\n          maintainers {\n            github_id\n          }\n        }\n        organization {\n          name\n          github_org_id\n        }\n      }\n      success\n    }\n  }\n": types.CheckInstallationDocument,
    "\n  mutation EnableRewardsOnRepository($repositoryId: [String!]!) {\n    enableRewardsOnRepository(repositoryId: $repositoryId) {\n      success\n      error\n    }\n  }\n": types.EnableRewardsOnRepositoryDocument,
    "\n  query ListOrganizationsForOwner {\n      listOrganizationsForOwner {\n          id\n          name\n          created_at\n      }\n  }\n": types.ListOrganizationsForOwnerDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOwnerDashboard {\n    getOwnerDashboard {\n      organizations {\n        id\n        name\n        githubOrgId\n        installationId\n        appInstalled\n        suspended\n        ownerGithubId\n        createdAt\n        updatedAt\n        repositories {\n          id\n          name\n          github_repo_id\n          enabled_rewards\n          is_removed\n          created_at\n          maintainers {\n            id\n            github_id\n            role\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetOwnerDashboard {\n    getOwnerDashboard {\n      organizations {\n        id\n        name\n        githubOrgId\n        installationId\n        appInstalled\n        suspended\n        ownerGithubId\n        createdAt\n        updatedAt\n        repositories {\n          id\n          name\n          github_repo_id\n          enabled_rewards\n          is_removed\n          created_at\n          maintainers {\n            id\n            github_id\n            role\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizationDetails($organizationId: String!) {\n    getOrganizationDetails(organizationId: $organizationId) {\n      id\n      name\n      githubOrgId\n      installationId\n      appInstalled\n      suspended\n      ownerGithubId\n      createdAt\n      updatedAt\n      repositories {\n        id\n        name\n        github_repo_id\n        enabled_rewards\n        is_removed\n        created_at\n        maintainers {\n          id\n          github_id\n          role\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetOrganizationDetails($organizationId: String!) {\n    getOrganizationDetails(organizationId: $organizationId) {\n      id\n      name\n      githubOrgId\n      installationId\n      appInstalled\n      suspended\n      ownerGithubId\n      createdAt\n      updatedAt\n      repositories {\n        id\n        name\n        github_repo_id\n        enabled_rewards\n        is_removed\n        created_at\n        maintainers {\n          id\n          github_id\n          role\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizationActivity(\n    $organizationId: String!\n    $limit: Int\n    $offset: Int\n  ) {\n    getOrganizationActivity(\n      organizationId: $organizationId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      activity_type\n      title\n      description\n      repository_id\n      reward_id\n      actor_id\n      actor_name\n      amount\n      pr_number\n      issue_number\n      created_at\n    }\n  }\n"): (typeof documents)["\n  query GetOrganizationActivity(\n    $organizationId: String!\n    $limit: Int\n    $offset: Int\n  ) {\n    getOrganizationActivity(\n      organizationId: $organizationId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      activity_type\n      title\n      description\n      repository_id\n      reward_id\n      actor_id\n      actor_name\n      amount\n      pr_number\n      issue_number\n      created_at\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetPendingRewards($organizationId: String!, $limit: Int, $offset: Int) {\n    getPendingRewards(\n      organizationId: $organizationId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      pr_number\n      secret\n      token_amount\n      claimed\n      confirmed\n      comment\n      created_at\n      repository {\n        id\n        name\n      }\n      contributor {\n        id\n        github_id\n      }\n      issuer {\n        id\n        github_id\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetPendingRewards($organizationId: String!, $limit: Int, $offset: Int) {\n    getPendingRewards(\n      organizationId: $organizationId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      pr_number\n      secret\n      token_amount\n      claimed\n      confirmed\n      comment\n      created_at\n      repository {\n        id\n        name\n      }\n      contributor {\n        id\n        github_id\n      }\n      issuer {\n        id\n        github_id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRepositoryRewards(\n    $repositoryId: String!\n    $limit: Int\n    $offset: Int\n  ) {\n    getRepositoryRewards(\n      repositoryId: $repositoryId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      pr_number\n      token_amount\n      claimed\n      confirmed\n      comment\n      created_at\n      contributor {\n        github_id\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetRepositoryRewards(\n    $repositoryId: String!\n    $limit: Int\n    $offset: Int\n  ) {\n    getRepositoryRewards(\n      repositoryId: $repositoryId\n      limit: $limit\n      offset: $offset\n    ) {\n      id\n      pr_number\n      token_amount\n      claimed\n      confirmed\n      comment\n      created_at\n      contributor {\n        github_id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetOrganizationStats($organizationId: String!) {\n    getOrganizationStats(organizationId: $organizationId) {\n      totalBalance\n      totalRepositories\n      activeRepositories\n      totalRewardsDistributed\n      totalRewardsClaimed\n      totalRewardsPending\n      totalPendingAmount\n      uniqueContributors\n    }\n  }\n"): (typeof documents)["\n  query GetOrganizationStats($organizationId: String!) {\n    getOrganizationStats(organizationId: $organizationId) {\n      totalBalance\n      totalRepositories\n      activeRepositories\n      totalRewardsDistributed\n      totalRewardsClaimed\n      totalRewardsPending\n      totalPendingAmount\n      uniqueContributors\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRepositoryStats($repositoryId: String!) {\n    getRepositoryStats(repositoryId: $repositoryId) {\n      totalRewards\n      totalDistributed\n      totalPending\n      pendingAmount\n      uniqueContributors\n      maintainerCount\n    }\n  }\n"): (typeof documents)["\n  query GetRepositoryStats($repositoryId: String!) {\n    getRepositoryStats(repositoryId: $repositoryId) {\n      totalRewards\n      totalDistributed\n      totalPending\n      pendingAmount\n      uniqueContributors\n      maintainerCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetGlobalStats {\n    getGlobalStats {\n      totalBalance\n      totalOrganizations\n      totalRepositories\n      totalActiveRepositories\n      totalContributors\n      totalRewardsDistributed\n      totalPendingRewards\n    }\n  }\n"): (typeof documents)["\n  query GetGlobalStats {\n    getGlobalStats {\n      totalBalance\n      totalOrganizations\n      totalRepositories\n      totalActiveRepositories\n      totalContributors\n      totalRewardsDistributed\n      totalPendingRewards\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetRepositoryStatsBatch($repositoryIds: [String!]!) {\n    getRepositoryStatsBatch(repositoryIds: $repositoryIds) {\n      totalRewards\n      totalDistributed\n      totalPending\n      pendingAmount\n      uniqueContributors\n      maintainerCount\n    }\n  }\n"): (typeof documents)["\n  query GetRepositoryStatsBatch($repositoryIds: [String!]!) {\n    getRepositoryStatsBatch(repositoryIds: $repositoryIds) {\n      totalRewards\n      totalDistributed\n      totalPending\n      pendingAmount\n      uniqueContributors\n      maintainerCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListOrganizationsForOwner {\n    listOrganizationsForOwner {\n      id\n      name\n      created_at\n    }\n  }\n"): (typeof documents)["\n  query ListOrganizationsForOwner {\n    listOrganizationsForOwner {\n      id\n      name\n      created_at\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CheckInstallation($installationId: String!) {\n    checkInstallation(installationId: $installationId) {\n      error\n      data {\n        type\n        repositories {\n          id\n          enabled_rewards\n          name\n          github_repo_id\n          maintainers {\n            github_id\n          }\n        }\n        organization {\n          name\n          github_org_id\n        }\n      }\n      success\n    }\n  }\n"): (typeof documents)["\n  query CheckInstallation($installationId: String!) {\n    checkInstallation(installationId: $installationId) {\n      error\n      data {\n        type\n        repositories {\n          id\n          enabled_rewards\n          name\n          github_repo_id\n          maintainers {\n            github_id\n          }\n        }\n        organization {\n          name\n          github_org_id\n        }\n      }\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EnableRewardsOnRepository($repositoryId: [String!]!) {\n    enableRewardsOnRepository(repositoryId: $repositoryId) {\n      success\n      error\n    }\n  }\n"): (typeof documents)["\n  mutation EnableRewardsOnRepository($repositoryId: [String!]!) {\n    enableRewardsOnRepository(repositoryId: $repositoryId) {\n      success\n      error\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ListOrganizationsForOwner {\n      listOrganizationsForOwner {\n          id\n          name\n          created_at\n      }\n  }\n"): (typeof documents)["\n  query ListOrganizationsForOwner {\n      listOrganizationsForOwner {\n          id\n          name\n          created_at\n      }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
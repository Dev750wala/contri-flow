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
    "\n  query ListOrganizationsForOwner {\n      listOrganizationsForOwner {\n          id\n          name\n          created_at\n      }\n  }\n": typeof types.ListOrganizationsForOwnerDocument,
    "\n  query CheckInstallation($installationId: String!) {\n    checkInstallation(installationId: $installationId) {\n      error\n      data {\n        type\n        repositories {\n          id\n          enabled_rewards\n          name\n          github_repo_id\n          maintainers {\n            github_id\n          }\n        }\n        organization {\n          name\n          github_org_id\n        }\n      }\n      success\n    }\n  }\n": typeof types.CheckInstallationDocument,
    "\n  mutation EnableRewardsOnRepository($repositoryId: [String!]!) {\n    enableRewardsOnRepository(repositoryId: $repositoryId) {\n      success\n      error\n    }\n  }\n": typeof types.EnableRewardsOnRepositoryDocument,
};
const documents: Documents = {
    "\n  query ListOrganizationsForOwner {\n      listOrganizationsForOwner {\n          id\n          name\n          created_at\n      }\n  }\n": types.ListOrganizationsForOwnerDocument,
    "\n  query CheckInstallation($installationId: String!) {\n    checkInstallation(installationId: $installationId) {\n      error\n      data {\n        type\n        repositories {\n          id\n          enabled_rewards\n          name\n          github_repo_id\n          maintainers {\n            github_id\n          }\n        }\n        organization {\n          name\n          github_org_id\n        }\n      }\n      success\n    }\n  }\n": types.CheckInstallationDocument,
    "\n  mutation EnableRewardsOnRepository($repositoryId: [String!]!) {\n    enableRewardsOnRepository(repositoryId: $repositoryId) {\n      success\n      error\n    }\n  }\n": types.EnableRewardsOnRepositoryDocument,
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
export function graphql(source: "\n  query ListOrganizationsForOwner {\n      listOrganizationsForOwner {\n          id\n          name\n          created_at\n      }\n  }\n"): (typeof documents)["\n  query ListOrganizationsForOwner {\n      listOrganizationsForOwner {\n          id\n          name\n          created_at\n      }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CheckInstallation($installationId: String!) {\n    checkInstallation(installationId: $installationId) {\n      error\n      data {\n        type\n        repositories {\n          id\n          enabled_rewards\n          name\n          github_repo_id\n          maintainers {\n            github_id\n          }\n        }\n        organization {\n          name\n          github_org_id\n        }\n      }\n      success\n    }\n  }\n"): (typeof documents)["\n  query CheckInstallation($installationId: String!) {\n    checkInstallation(installationId: $installationId) {\n      error\n      data {\n        type\n        repositories {\n          id\n          enabled_rewards\n          name\n          github_repo_id\n          maintainers {\n            github_id\n          }\n        }\n        organization {\n          name\n          github_org_id\n        }\n      }\n      success\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation EnableRewardsOnRepository($repositoryId: [String!]!) {\n    enableRewardsOnRepository(repositoryId: $repositoryId) {\n      success\n      error\n    }\n  }\n"): (typeof documents)["\n  mutation EnableRewardsOnRepository($repositoryId: [String!]!) {\n    enableRewardsOnRepository(repositoryId: $repositoryId) {\n      success\n      error\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
import { gql } from "@apollo/client";

export * from './dashboard.operations';
export * from './contributor.operations';

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
`

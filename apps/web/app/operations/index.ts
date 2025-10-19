import { gql } from "@apollo/client";

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
          name
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
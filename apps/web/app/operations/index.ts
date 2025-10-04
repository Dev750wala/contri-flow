import { gql } from "@apollo/client";

export const LIST_ORGANIZATIONS_FOR_OWNER = gql`
    query ListOrganizationsForOwner {
        listOrganizationsForOwner {
            id
            name
            created_at
        }
    }
`
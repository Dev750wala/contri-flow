import {
  ListOrganizationsForOwnerDocument,
  ListOrganizationsForOwnerQuery,
} from '@/codegen/generated/graphql';
import { useLazyQuery } from '@apollo/client';

export const useFetchOrganizationsForOwner = () => {
  const [fetchOrganizations, { data, loading, error }] =
    useLazyQuery<ListOrganizationsForOwnerQuery>(
      ListOrganizationsForOwnerDocument
    );

  return {
    data,
    loading,
    error,
    fetchOrganizations,
  };
};

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import {
  CheckInstallationDocument,
  CheckInstallationQuery,
  EnableRewardsOnRepositoryDocument,
  EnableRewardsOnRepositoryMutation,
} from '@/codegen/generated/graphql';
import { Repository } from '@/components/RepositoryCard';

export const useNewInstallationSetup = () => {
  const searchParams = useSearchParams();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [enabledRepoIds, setEnabledRepoIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetchingMaintainers, setFetchingMaintainers] = useState(false);

  const router = useRouter();

  const setupAction = searchParams.get('setup_action');
  const installationId = searchParams.get('installation_id');

  const { 
    data: checkInstallationData, 
    loading: checkInstallationLoading, 
    error: checkInstallationError 
  } = useQuery<CheckInstallationQuery>(CheckInstallationDocument, {
    variables: { installationId },
    skip: !installationId,
  });

  const [
    enableRewardsOnRepository, 
    { loading: enablingRewards, error: enablingRewardsError }
  ] = useMutation<EnableRewardsOnRepositoryMutation>(EnableRewardsOnRepositoryDocument);

  useEffect(() => {
    if (checkInstallationData?.checkInstallation?.data?.repositories) {
      const backendRepos = checkInstallationData.checkInstallation.data.repositories;
      const orgName = checkInstallationData.checkInstallation.data.organization?.name || '';

      const fetchMaintainerDetails = async () => {
        setFetchingMaintainers(true);
        try {
          const transformedRepos: Repository[] = await Promise.all(
            backendRepos.map(async (repo) => {
              const maintainersWithDetails = await Promise.all(
                repo.maintainers.map(async (maintainer, index) => {
                  try {
                    const response = await fetch(`https://api.github.com/user/${maintainer.github_id}`);
                    if (response.ok) {
                      const userData = await response.json();
                      return {
                        id: `${maintainer.github_id}-${index}`,
                        username: userData.login || `User-${maintainer.github_id}`,
                        avatar: userData.avatar_url || `https://avatars.githubusercontent.com/u/${maintainer.github_id}?v=4`,
                      };
                    }
                  } catch (error) {
                    console.error(`Error fetching user ${maintainer.github_id}:`, error);
                  }
                  
                  return {
                    id: `${maintainer.github_id}-${index}`,
                    username: `User-${maintainer.github_id}`,
                    avatar: `https://avatars.githubusercontent.com/u/${maintainer.github_id}?v=4`,
                  };
                })
              );

              return {
                id: repo.id,
                name: repo.name,
                owner: orgName,
                fullName: `${orgName}/${repo.name}`,
                githubUrl: `https://github.com/${orgName}/${repo.name}`,
                rewardsEnabled: repo.enabled_rewards,
                maintainers: maintainersWithDetails,
              };
            })
          );

          setRepositories(transformedRepos);

          const enabledIds = new Set(
            transformedRepos
              .filter(repo => repo.rewardsEnabled)
              .map(repo => repo.id)
          );
          setEnabledRepoIds(enabledIds);
        } catch (error) {
          console.error('Error fetching maintainer details:', error);
        } finally {
          setFetchingMaintainers(false);
        }
      };

      fetchMaintainerDetails();
    }
  }, [checkInstallationData]);

  const handleToggleRewards = (repoId: string, enabled: boolean) => {
    setEnabledRepoIds(prev => {
      const newSet = new Set(prev);
      if (enabled) {
        newSet.add(repoId);
      } else {
        newSet.delete(repoId);
      }
      return newSet;
    });
    
    setRepositories(prev =>
      prev.map(repo =>
        repo.id === repoId
          ? { ...repo, rewardsEnabled: enabled }
          : repo
      )
    );
  };

  const handleManageSettings = (repoId: string) => {
    const currentlyEnabled = enabledRepoIds.has(repoId);
    handleToggleRewards(repoId, !currentlyEnabled);
  };

  const handleAddRepositories = async () => {
    if (enabledRepoIds.size === 0) {
      return;
    }

    setLoading(true);
    try {
      const repositoryIds = Array.from(enabledRepoIds);
      console.log('Enabling repositories:', repositoryIds);
      
      const { data } = await enableRewardsOnRepository({
        variables: {
          repositoryId: repositoryIds
        }
      });

      if (data?.enableRewardsOnRepository?.success) {
        router.push('/dashboard');
      } else {
        const errorMessage = data?.enableRewardsOnRepository?.error || 'Failed to enable rewards. Please try again.';
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error enabling repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    repositories,
    enabledRepoIds,
    loading,
    fetchingMaintainers,
    setupAction,
    installationId,
    checkInstallationLoading,
    checkInstallationError,
    enablingRewards,
    enablingRewardsError,
    handleToggleRewards,
    handleManageSettings,
    handleAddRepositories,
  };
};

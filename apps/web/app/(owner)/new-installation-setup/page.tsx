'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RepositoryCard, { Repository } from '@/components/RepositoryCard';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckInstallationDocument,
  CheckInstallationQuery,
} from '@/codegen/generated/graphql';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Github,
  ArrowRight,
  Settings
} from 'lucide-react';
import { createLanguage } from '@/constants/languages';
import { useQuery } from '@apollo/client';

// Platform token info constant
const PLATFORM_TOKEN_INFO = {
  symbol: 'MPT',
  address: '0xa62fCE379F63E7f4cA1dcDEe355Cb21e9FbA8775',
  name: 'MergePay Token'
};

// Backend repository response type
interface BackendRepository {
  id: string | number;
  name: string;
  owner: string;
  full_name: string;
  html_url: string;
  languages?: string[]; // Array of language names from backend
}

const NewInstallationPageContent = () => {
  const searchParams = useSearchParams();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [enabledRepoIds, setEnabledRepoIds] = useState<Set<string>>(new Set());
  
  // Get query parameters from GitHub App installation
  const setupAction = searchParams.get('setup_action');
  const installationId = searchParams.get('installation_id');
  const state = searchParams.get('state');

  const { data: checkInstallationData, loading, error } = useQuery<CheckInstallationQuery>(CheckInstallationDocument, {
    variables: { installationId },
    skip: !installationId,
  });

  // Transform backend repository data to frontend format
  const transformRepository = (backendRepo: BackendRepository): Repository => {
    const repoId = String(backendRepo.id);
    
    return {
      id: repoId,
      name: backendRepo.name,
      owner: backendRepo.owner,
      fullName: backendRepo.full_name,
      githubUrl: backendRepo.html_url,
      rewardsEnabled: enabledRepoIds.has(repoId),
      maintainers: [], // Will be populated from backend if needed
      tokenInfo: PLATFORM_TOKEN_INFO,
      webhookActive: false
    };
  };

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
    
    // Update the repository's rewardsEnabled state directly
    setRepositories(prev =>
      prev.map(repo =>
        repo.id === repoId
          ? { ...repo, rewardsEnabled: enabled }
          : repo
      )
    );
  };

  const handleManageSettings = (repoId: string) => {
    // For onboarding, this will enable/disable the repository
    const currentlyEnabled = enabledRepoIds.has(repoId);
    handleToggleRewards(repoId, !currentlyEnabled);
  };

  const handleAddRepositories = async () => {
    if (enabledRepoIds.size === 0) {
      alert('Please select at least one repository to enable rewards.');
      return;
    }

    setLoading(true);
    try {
      // TODO: Add mutation logic here to save enabled repositories to backend
      console.log('Enabling repositories:', Array.from(enabledRepoIds));
      
      // Example mutation:
      // const response = await fetch('/api/graphql', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     query: `
      //       mutation EnableRepositories($installationId: String!, $repositoryIds: [String!]!) {
      //         enableRepositories(installationId: $installationId, repositoryIds: $repositoryIds) {
      //           success
      //           message
      //         }
      //       }
      //     `,
      //     variables: {
      //       installationId,
      //       repositoryIds: Array.from(enabledRepoIds)
      //     }
      //   })
      // });
      // const { data } = await response.json();
      // if (data.enableRepositories.success) {
      //   // Redirect to dashboard or success page
      //   window.location.href = '/dashboard';
      // }
    } catch (error) {
      console.error('Error enabling repositories:', error);
      alert('Failed to enable repositories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render content based on setup_action
  const renderContent = () => {
    switch (setupAction) {
      case 'request':
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    Installation Request Submitted
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-orange-800 dark:text-orange-200">
                    Your request to install ContriFlow has been submitted to the organization owner.
                  </p>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-300">
                        <Github className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The organization owner will receive a notification and can approve or deny the installation.
                      You'll be notified once a decision is made.
                    </p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={() => window.close()}>
                      Close Window
                    </Button>
                    <Button asChild>
                      <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Installations
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'install':
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
              {/* Success Header */}
              <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-green-900 dark:text-green-100">
                    Installation Successful!
                  </h1>
                  <p className="text-green-700 dark:text-green-300 mt-2">
                    ContriFlow has been successfully installed. Now select which repositories you want to enable rewards for.
                  </p>
                </div>
                {installationId && (
                  <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                    Installation ID: {installationId}
                  </Badge>
                )}
              </div>

              {/* Repository Selection */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">Select Repositories</h2>
                  <p className="text-muted-foreground">
                    Choose which GitHub repositories you want to enable rewards for.
                  </p>
                </div>

                {/* Repository Grid */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground">Loading repositories...</p>
                    </div>
                  </div>
                ) : repositories.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {repositories.map((repository) => (
                      <RepositoryCard
                        key={repository.id}
                        repository={repository}
                        onToggleRewards={handleToggleRewards}
                        onManageSettings={handleManageSettings}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No repositories found for this installation.</p>
                  </div>
                )}

                {/* Save Button */}
                {repositories.length > 0 && (
                  <div className="flex flex-col items-center gap-4 pt-6">
                    <div className="text-sm text-muted-foreground">
                      {enabledRepoIds.size} {enabledRepoIds.size === 1 ? 'repository' : 'repositories'} selected
                    </div>
                    <Button 
                      size="lg" 
                      className="min-w-[200px]"
                      onClick={handleAddRepositories}
                      disabled={loading || enabledRepoIds.size === 0}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Continue Setup
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'update':
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    Installation Updated
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-blue-800 dark:text-blue-200">
                    Your ContriFlow installation has been successfully updated with new permissions or repository access.
                  </p>
                  {installationId && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                      Installation ID: {installationId}
                    </Badge>
                  )}
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={() => window.history.back()}>
                      Go Back
                    </Button>
                    <Button asChild>
                      <a href="/dashboard">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'cancel':
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-red-900 dark:text-red-100">
                    Installation Cancelled
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-red-800 dark:text-red-200">
                    The ContriFlow installation was cancelled. You can try installing again anytime.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={() => window.close()}>
                      Close Window
                    </Button>
                    <Button>
                      <Github className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        // No setup_action or unknown value - show general installation page
        return (
          <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">ContriFlow Setup</h1>
                <p className="text-muted-foreground">
                  Welcome to ContriFlow! Set up automated rewards for your GitHub repositories.
                </p>
              </div>

              {!setupAction && (
                <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                  <CardContent className="flex items-center space-x-3 pt-6">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-yellow-800 dark:text-yellow-200">
                      It looks like you accessed this page directly. Please install the GitHub App first.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-center">
                <Button size="lg" asChild>
                  <a href="https://github.com/apps/contriflow/installations/new" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    Install GitHub App
                  </a>
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Navbar />
      {renderContent()}
    </>
  );
};

const NewInstallationPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewInstallationPageContent />
    </Suspense>
  );
};

export default NewInstallationPage;
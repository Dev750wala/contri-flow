'use client';

import React, { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RepositoryCard from '@/components/RepositoryCard';
import Navbar from '@/components/navbar';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  Github,
  ArrowRight,
  Settings,
  Users,
  Loader2
} from 'lucide-react';
import { useNewInstallationSetup } from './useNewInstallationSetup';
import { MPT_TOKEN_ADDRESS } from '@/web3/constants';

const PLATFORM_TOKEN_INFO = {
  symbol: 'MPT',
  address: MPT_TOKEN_ADDRESS,
  name: 'MergePay Token'
};

const NewInstallationPageContent = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
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
  } = useNewInstallationSetup();

  React.useEffect(() => {
    if (status === 'loading') return; 

    if (!session) {
      const returnUrl = encodeURIComponent(window.location.href);
      router.push(`/auth/sign-in?callbackUrl=${returnUrl}`);
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Video Background */}
        <div className="fixed inset-0 w-screen h-screen z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
          >
            <source src="/HomeVideoBackground.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        </div>
        <Navbar />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-white">Authenticating...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const renderContent = () => {
    switch (setupAction) {
      case 'request':
        return (
          <div className="min-h-screen bg-gradient-to-b from-background via-background to-orange-50/20 dark:to-orange-950/10 flex items-center justify-center">
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-2xl mx-auto">
                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 dark:border-orange-800 dark:from-orange-950/20 dark:via-background dark:to-orange-950/10 shadow-xl">
                  <CardContent className="pt-12 pb-10">
                    <div className="text-center space-y-6">
                      {/* Animated Icon */}
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full animate-pulse"></div>
                        <div className="relative mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg animate-bounce">
                          <Clock className="h-10 w-10 text-white" />
                        </div>
                      </div>

                      {/* Header */}
                      <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-700 to-orange-900 dark:from-orange-400 dark:to-orange-600 bg-clip-text text-transparent">
                          Installation Request Submitted
                        </CardTitle>
                        <p className="text-orange-800 dark:text-orange-200 text-lg">
                          Your request to install ContriFlow has been submitted to the organization owner.
                        </p>
                      </div>

                      {/* Status Card */}
                      <Card className="bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-800 shadow-md">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-center justify-center">
                            <Badge className="bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700 text-sm py-1.5 px-4">
                              <Github className="h-4 w-4 mr-2" />
                              Pending Approval
                            </Badge>
                          </div>
                          <div className="space-y-2 text-left px-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              <strong className="text-foreground">What happens next?</strong>
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                              <li>The organization owner will receive a notification</li>
                              <li>They can approve or deny the installation request</li>
                              <li>You'll be notified via email once a decision is made</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                        <Button variant="outline" onClick={() => window.close()} className="min-w-[160px]">
                          Close Window
                        </Button>
                        <Button asChild className="min-w-[160px]">
                          <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer">
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Installations
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'install':
        return (
          <div className="relative min-h-screen w-full overflow-hidden">
            {/* Video Background */}
            <div className="fixed inset-0 w-screen h-screen z-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              >
                <source src="/HomeVideoBackground.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
            </div>

            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 container mx-auto py-8 px-4 max-w-7xl pt-28">
              {/* Success Header Section */}
              <Card className="mb-8 border-green-500/50 bg-slate-900/80 backdrop-blur-lg shadow-lg">
                <CardContent className="pt-8 pb-8">
                  <div className="max-w-3xl mx-auto text-center space-y-4">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>
                      <div className="relative mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-4xl font-bold tracking-tight text-white">
                        Installation Successful!
                      </h1>
                      <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        ContriFlow has been successfully installed on your GitHub account. 
                        Now select which repositories you want to enable automated rewards for.
                      </p>
                    </div>
                    {installationId && (
                      <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10 text-sm py-1 px-3">
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Installation ID: {installationId}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Repository Selection Section */}
              <div className="space-y-6">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Configure Repositories</h2>
                    <p className="text-slate-300 mt-1">
                      Enable reward systems for your GitHub repositories
                    </p>
                  </div>
                  {repositories.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/60 rounded-lg border border-slate-700">
                      <div className="text-sm font-medium text-slate-300">
                        Selected:
                      </div>
                      <Badge variant="secondary" className="text-base font-semibold bg-sky-500/20 text-sky-300 border-sky-500/30">
                        {enabledRepoIds.size} / {repositories.length}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Repository Grid or Loading/Error States */}
                {checkInstallationLoading || fetchingMaintainers ? (
                  <Card className="border-dashed border-slate-700 bg-slate-900/80 backdrop-blur-lg">
                    <CardContent className="flex flex-col justify-center items-center py-16">
                      <div className="relative">
                        <div className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full animate-pulse"></div>
                        <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-sky-500"></div>
                      </div>
                      <p className="text-slate-200 mt-6 text-lg font-medium">
                        {checkInstallationLoading ? 'Loading your repositories...' : 'Fetching maintainer details...'}
                      </p>
                      <p className="text-sm text-slate-400 mt-2">This may take a moment</p>
                    </CardContent>
                  </Card>
                ) : checkInstallationError ? (
                  <Card className="border-red-500/50 bg-slate-900/80 backdrop-blur-lg">
                    <CardContent className="flex flex-col items-center py-12 text-center">
                      <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                        <XCircle className="h-6 w-6 text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Error Loading Repositories
                      </h3>
                      <p className="text-slate-300 max-w-md">
                        {checkInstallationError.message}
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-6"
                        onClick={() => window.location.reload()}
                      >
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : repositories.length > 0 ? (
                  <>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {repositories.map((repository) => (
                        <RepositoryCard
                          key={repository.id}
                          repository={repository}
                          onToggleRewards={handleToggleRewards}
                          onManageSettings={handleManageSettings}
                        />
                      ))}
                    </div>

                    {/* Action Footer */}
                    <Card className="sticky bottom-4 border-2 border-slate-700 shadow-2xl bg-slate-900/95 backdrop-blur-sm">
                      <CardContent className="py-6">
                        {/* Error Display */}
                        {enablingRewardsError && (
                          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                            <p className="text-sm text-red-300">
                              {enablingRewardsError.message || 'Failed to enable rewards. Please try again.'}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          <div className="text-center md:text-left">
                            <div className="text-sm font-medium text-slate-300">
                              {enabledRepoIds.size === 0 ? (
                                <>
                                  <AlertTriangle className="h-4 w-4 inline mr-2 text-yellow-400" />
                                  Select at least one repository to continue
                                </>
                              ) : (
                                <>
                                  You've selected <span className="font-bold text-white">{enabledRepoIds.size}</span> {enabledRepoIds.size === 1 ? 'repository' : 'repositories'} for automated rewards
                                </>
                              )}
                            </div>
                            {enabledRepoIds.size > 0 && (
                              <div className="text-xs text-slate-400 mt-1">
                                Platform Token: {PLATFORM_TOKEN_INFO.symbol} ({PLATFORM_TOKEN_INFO.name})
                              </div>
                            )}
                          </div>
                          <Button 
                            size="lg" 
                            className="min-w-[200px] shadow-lg hover:shadow-xl transition-all"
                            onClick={handleAddRepositories}
                            disabled={loading || enablingRewards || enabledRepoIds.size === 0}
                          >
                            {(loading || enablingRewards) ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                {enablingRewards ? 'Enabling Rewards...' : 'Processing...'}
                              </>
                            ) : (
                              <>
                                Continue Setup
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="border-dashed border-slate-700 bg-slate-900/80 backdrop-blur-lg">
                    <CardContent className="flex flex-col items-center py-16 text-center">
                      <div className="h-16 w-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                        <Github className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-white">No Repositories Found</h3>
                      <p className="text-slate-300 max-w-md mb-6">
                        We couldn't find any repositories for this installation. 
                        Please check your GitHub App settings.
                      </p>
                      <Button asChild variant="outline">
                        <a href="https://github.com/settings/installations" target="_blank" rel="noopener noreferrer">
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Installations
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        );

      case 'update':
        return (
          <div className="min-h-screen bg-gradient-to-b from-background via-background to-blue-50/20 dark:to-blue-950/10 flex items-center justify-center">
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-2xl mx-auto">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:border-blue-800 dark:from-blue-950/20 dark:via-background dark:to-blue-950/10 shadow-xl">
                  <CardContent className="pt-12 pb-10">
                    <div className="text-center space-y-6">
                      {/* Icon */}
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                        <div className="relative mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                          <Settings className="h-10 w-10 text-white animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                      </div>

                      {/* Header */}
                      <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                          Installation Updated Successfully
                        </CardTitle>
                        <p className="text-blue-800 dark:text-blue-200 text-lg max-w-lg mx-auto">
                          Your ContriFlow installation has been updated with new permissions or repository access.
                        </p>
                      </div>

                      {/* Installation ID Badge */}
                      {installationId && (
                        <div className="flex justify-center">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 text-sm py-1.5 px-4">
                            <CheckCircle className="h-3 w-3 mr-2" />
                            Installation ID: {installationId}
                          </Badge>
                        </div>
                      )}

                      {/* Info Card */}
                      <Card className="bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 shadow-md">
                        <CardContent className="pt-6">
                          <div className="text-left space-y-3 px-4">
                            <p className="text-sm font-medium text-foreground">
                              What's been updated:
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                              <li>New repository access permissions</li>
                              <li>Updated GitHub App settings</li>
                              <li>Latest features and improvements</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                        <Button variant="outline" onClick={() => window.history.back()} className="min-w-[160px]">
                          Go Back
                        </Button>
                        <Button asChild className="min-w-[160px]">
                          <a href="/dashboard">
                            Go to Dashboard
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 'cancel':
        return (
          <div className="min-h-screen bg-gradient-to-b from-background via-background to-red-50/20 dark:to-red-950/10 flex items-center justify-center">
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-2xl mx-auto">
                <Card className="border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50/50 dark:border-red-800 dark:from-red-950/20 dark:via-background dark:to-red-950/10 shadow-xl">
                  <CardContent className="pt-12 pb-10">
                    <div className="text-center space-y-6">
                      {/* Icon */}
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
                        <div className="relative mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
                          <XCircle className="h-10 w-10 text-white" />
                        </div>
                      </div>

                      {/* Header */}
                      <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-700 to-red-900 dark:from-red-400 dark:to-red-600 bg-clip-text text-transparent">
                          Installation Cancelled
                        </CardTitle>
                        <p className="text-red-800 dark:text-red-200 text-lg">
                          The ContriFlow installation was cancelled.
                        </p>
                      </div>

                      {/* Info Card */}
                      <Card className="bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 shadow-md">
                        <CardContent className="pt-6">
                          <div className="text-center space-y-3 px-4">
                            <p className="text-sm text-muted-foreground">
                              Don't worry! You can install ContriFlow anytime to start automating your repository rewards.
                            </p>
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground font-medium">
                                Why use ContriFlow?
                              </p>
                              <ul className="text-xs text-muted-foreground space-y-1 mt-2 text-left inline-block">
                                <li>✓ Automate contributor rewards</li>
                                <li>✓ Track contributions efficiently</li>
                                <li>✓ Build engaged communities</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                        <Button variant="outline" onClick={() => window.close()} className="min-w-[160px]">
                          Close Window
                        </Button>
                        <Button asChild className="min-w-[160px]">
                          <a href="https://github.com/apps/contriflow/installations/new" target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            Try Again
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
            <div className="container mx-auto py-8 px-4">
              <div className="max-w-3xl mx-auto">
                <Card className="border-2 shadow-xl">
                  <CardContent className="pt-12 pb-10">
                    <div className="text-center space-y-6">
                      {/* Icon */}
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                        <div className="relative mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg">
                          <Github className="h-10 w-10 text-white" />
                        </div>
                      </div>

                      {/* Header */}
                      <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                          Welcome to ContriFlow
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                          Automate rewards for your GitHub repositories and build thriving contributor communities.
                        </p>
                      </div>

                      {/* Warning Card */}
                      {!setupAction && (
                        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30 shadow-sm">
                          <CardContent className="flex items-center gap-3 pt-6">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm text-left">
                              It looks like you accessed this page directly. Please install the GitHub App first to get started.
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Features Grid */}
                      <div className="grid md:grid-cols-3 gap-4 pt-4">
                        <Card className="bg-muted/50 border-muted">
                          <CardContent className="pt-6 text-center">
                            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-semibold mb-1 text-sm">Automated Rewards</h3>
                            <p className="text-xs text-muted-foreground">Reward contributors automatically</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/50 border-muted">
                          <CardContent className="pt-6 text-center">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold mb-1 text-sm">Community Building</h3>
                            <p className="text-xs text-muted-foreground">Grow engaged communities</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/50 border-muted">
                          <CardContent className="pt-6 text-center">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="font-semibold mb-1 text-sm">Easy Management</h3>
                            <p className="text-xs text-muted-foreground">Simple setup and control</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-6">
                        <Button size="lg" asChild className="min-w-[240px] shadow-lg hover:shadow-xl transition-all">
                          <a href="https://github.com/apps/contriflow/installations/new" target="_blank" rel="noopener noreferrer">
                            <Github className="h-5 w-5 mr-2" />
                            Install GitHub App
                          </a>
                        </Button>
                        <p className="text-xs text-muted-foreground mt-3">
                          Free to install • Takes less than a minute
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
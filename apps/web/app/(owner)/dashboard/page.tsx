'use client'

import { OwnerDashboard } from '@/components/OwnerDashboard';
import Navbar from '@/components/navbar';
import React from 'react';
import { useOwnerDashboard } from './useOwnerDashboard';

const DashboardPage = () => {
  const {
    organizations,
    selectedOrg,
    selectedOrgId,
    activities,
    pendingRewards,
    orgStats,
    globalStats,
    dashboardLoading,
    orgStatsLoading,
    allRepositories,
    selectOrganization,
  } = useOwnerDashboard();

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <div className="border-b bg-gradient-to-r from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Owner Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your organizations, repositories, and distribute rewards
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OwnerDashboard
          organizations={organizations}
          selectedOrg={selectedOrg}
          selectedOrgId={selectedOrgId}
          activities={activities}
          pendingRewards={pendingRewards}
          orgStats={orgStats}
          globalStats={globalStats}
          orgStatsLoading={orgStatsLoading}
          allRepositories={allRepositories}
          onSelectOrganization={selectOrganization}
        />
      </div>
    </div>
  );
};

export default DashboardPage;

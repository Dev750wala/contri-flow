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
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <div className="border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm relative z-10 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Owner Dashboard
            </h1>
            <p className="text-slate-300 text-lg">
              Manage your organizations, repositories, and distribute rewards
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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

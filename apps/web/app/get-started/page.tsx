'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Code, ArrowRight, Users, Coins, CheckCircle } from 'lucide-react';
import { useFetchOrganizationsForOwner } from '@/hooks/useFetchOrganizationsForOwner';

export default function GetStartedPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { fetchOrganizations } = useFetchOrganizationsForOwner();
  const [isCheckingOrgs, setIsCheckingOrgs] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  const handleOwnerPath = async () => {
    setIsCheckingOrgs(true);
    try {
      const result = await fetchOrganizations();
      
      if (result.data?.listOrganizationsForOwner && result.data.listOrganizationsForOwner.length > 0) {
        // User has organizations, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User has no organizations, redirect to installation setup
        router.push('/installation-new');
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      // On error, redirect to installation setup as fallback
      router.push('/installation-new');
    } finally {
      setIsCheckingOrgs(false);
    }
  };

  const handleContributorPath = () => {
    // Redirect to contributor dashboard
    router.push('/contributor');
  };

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
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
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

      <div className="relative z-10 min-h-screen">
      <div className="container mx-auto px-4 py-16 pt-32">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Welcome to ContriFlow!
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              How would you like to use ContriFlow? You can switch between roles anytime.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Organization Owner Card */}
            <Card className="hover:shadow-2xl transition-all border-2 border-slate-700/50 hover:border-cyan-500 cursor-pointer group bg-slate-900/80 backdrop-blur-lg">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-10 w-10 text-cyan-400" />
                </div>
                <CardTitle className="text-2xl mb-2 text-white">Organization Owner</CardTitle>
                <CardDescription className="text-base text-slate-300">
                  Reward contributors for their work on your repositories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      Set up reward pools for your GitHub repositories
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      Automatically reward merged pull requests
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      Track contributions and manage your team
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      Transparent blockchain-based payment system
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  size="lg"
                  onClick={handleOwnerPath}
                  disabled={isCheckingOrgs}
                >
                  {isCheckingOrgs ? 'Loading...' : 'Set Up as Owner'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Contributor Card */}
            <Card className="hover:shadow-2xl transition-all border-2 border-slate-700/50 hover:border-purple-500 cursor-pointer group bg-slate-900/80 backdrop-blur-lg">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Code className="h-10 w-10 text-purple-400" />
                </div>
                <CardTitle className="text-2xl mb-2 text-white">Contributor</CardTitle>
                <CardDescription className="text-base text-slate-300">
                  Earn rewards for your open-source contributions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      Browse available reward opportunities
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      Get rewarded for merged pull requests
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      Track your earnings and claim rewards
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">
                      Instant MPT token payments to your wallet
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                  onClick={handleContributorPath}
                >
                  Start Contributing
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Note */}
          <div className="bg-slate-800/60 backdrop-blur-lg rounded-lg p-6 text-center border border-slate-700/50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-sky-400" />
              <p className="font-semibold text-white">You can be both!</p>
            </div>
            <p className="text-sm text-slate-300">
              Many users are both organization owners and contributors. 
              You can switch between roles anytime from your profile menu.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

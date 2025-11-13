import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import {
  ArrowRight,
  Github,
  Coins,
  Shield,
  Zap,
  Users,
  GitBranch,
} from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useFetchOrganizationsForOwner } from '@/hooks/useFetchOrganizationsForOwner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function LandingPage() {
  const { data: organizationsForOwner, loading, error, fetchOrganizations } = useFetchOrganizationsForOwner();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasOrganizations, setHasOrganizations] = useState<boolean | null>(null);
  const [isCheckingOrgs, setIsCheckingOrgs] = useState(false);

  // Check if user has organizations on mount (only if logged in)
  useEffect(() => {
    const checkUserOrganizations = async () => {
      if (status === 'authenticated' && !isCheckingOrgs && hasOrganizations === null) {
        setIsCheckingOrgs(true);
        try {
          const result = await fetchOrganizations();
          const hasOrgs = result.data?.listOrganizationsForOwner && 
                          result.data.listOrganizationsForOwner.length > 0;
          setHasOrganizations(hasOrgs);
        } catch (err) {
          console.error('Error checking organizations:', err);
          setHasOrganizations(false);
        } finally {
          setIsCheckingOrgs(false);
        }
      }
    };

    checkUserOrganizations();
  }, [status, fetchOrganizations, isCheckingOrgs, hasOrganizations]);

  const handleGetStarted = async () => {
    // If not authenticated, redirect to sign-in
    if (status !== 'authenticated') {
      router.push('/auth/sign-in');
      return;
    }

    // If authenticated, go to role selection page
    router.push('/get-started');
  };

  // Determine button text based on user status
  const getButtonText = () => {
    if (status === 'loading' || isCheckingOrgs) {
      return 'Loading...';
    }
    return 'Get Started';
  };

  const isButtonDisabled = status === 'loading' || isCheckingOrgs;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative py-24 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            Decentralized • Transparent • Secure
          </Badge>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
            MergePay
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            A decentralized platform that rewards open-source contributors with MPT tokens.
            Organizations fund development, contributors earn rewards for merged pull requests.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="flex items-center gap-3 px-8 py-4 text-lg font-semibold"
              onClick={handleGetStarted}
              disabled={isButtonDisabled}
            >
              {getButtonText()}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Solving Open Source Incentivization
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Open-source projects often lack proper incentivization for
              contributors, leading to missed opportunities for innovation and
              collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Lack of Incentives</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Talented developers contribute for free with no financial
                  rewards, limiting participation and quality contributions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>No Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Existing reward systems lack transparency and verifiable
                  tracking of contributions and payments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Manual Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No automated way to detect valuable contributions and
                  distribute rewards efficiently.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How ContriFlow Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our decentralized system automates the entire reward process from
              contribution detection to ETH distribution.
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold mb-8 text-center">
              Initial Setup Flow
            </h3>
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop"
                  alt="Initial Setup Flow Diagram"
                  className="w-full h-auto rounded-lg"
                />
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mb-2 mx-auto">
                      1
                    </div>
                    <p className="text-sm">GitHub Login</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mb-2 mx-auto">
                      2
                    </div>
                    <p className="text-sm">Connect Wallet</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mb-2 mx-auto">
                      3
                    </div>
                    <p className="text-sm">Add Repositories</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mb-2 mx-auto">
                      4
                    </div>
                    <p className="text-sm">Deposit ETH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Github className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">GitHub Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Seamless integration with GitHub repositories and pull request
                  monitoring.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Auto Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  AI bot automatically detects reward-worthy contributions and
                  generates vouchers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Blockchain Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Smart contracts ensure secure, transparent, and verifiable
                  reward distribution.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">ETH Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Contributors receive ETH rewards with real-time USD to ETH
                  conversion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              ContriFlow leverages cutting-edge blockchain and web technologies
              for a secure and seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              'Next.js',
              'TypeScript',
              'Solidity',
              'Ethereum',
              'Chainlink',
              'PostgreSQL',
            ].map((tech) => (
              <Card key={tech} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardContent className="py-8">
                  <Badge variant="outline" className="text-sm px-3 py-1">{tech}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Open Source?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Join ContriFlow and be part of the future of decentralized
            contribution rewards.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="flex items-center gap-3 px-8 py-4 text-lg font-semibold"
              onClick={handleGetStarted}
              disabled={isButtonDisabled}
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="flex items-center gap-3 px-8 py-4 text-lg font-semibold bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              onClick={() => router.push('/auth/sign-in')}
            >
              Learn More
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

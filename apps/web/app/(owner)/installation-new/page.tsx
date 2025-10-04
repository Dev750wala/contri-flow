'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Github, 
  ArrowRight, 
  CheckCircle, 
  Settings, 
  Users, 
  Zap,
  Gift,
  Star,
  ExternalLink,
  Coins,
  Shield,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const InstallationNewPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      // User is not authenticated, redirect to sign in
      router.push('/auth/sign-in');
      return;
    }
  }, [session, status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return null (redirect will happen in useEffect)
  if (!session) {
    return null;
  }

  const features = [
    {
      icon: <Gift className="h-6 w-6 text-primary" />,
      title: "Automated Rewards",
      description: "Automatically reward contributors based on their contributions"
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Team Management",
      description: "Manage your organization's contributors and track performance"
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Real-time Analytics",
      description: "Get insights into contribution patterns and reward distribution"
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Customizable Rules",
      description: "Set up custom reward rules based on your organization's needs"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Install GitHub App",
      description: "Click the button below to install our GitHub app to your organization",
      status: "current"
    },
    {
      number: "2",
      title: "Configure Settings",
      description: "Set up your reward preferences and contribution rules",
      status: "upcoming"
    },
    {
      number: "3",
      title: "Start Rewarding",
      description: "Begin your rewarding journey and motivate your contributors",
      status: "upcoming"
    }
  ];

  return (
    <div className="w-full min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 md:py-16 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Top Section - Heading and Installation Steps */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16 flex-1 min-h-screen py-30">
          {/* Left Column - Heading and Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              Organization Setup
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Install GitHub App
            </h1>
            <p className="text-lg text-muted-foreground">
              Install our GitHub app to your organization and start rewarding your contributors 
              for their valuable contributions.
            </p>
          </motion.div>

          {/* Right Column - Installation Steps Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Github className="h-5 w-5 text-primary" />
                  Installation Steps
                </CardTitle>
                <CardDescription>
                  Follow these simple steps to get your organization set up
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                      ${step.status === 'current' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`
                        font-semibold mb-1
                        ${step.status === 'current' ? 'text-primary' : ''}
                      `}>
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Installation Button */}
            <motion.div 
              className="mt-6"
              whileHover={{ scale: 1.00 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                asChild
                size="lg"
                className="w-full flex items-center gap-3 px-8 py-4 text-lg font-semibold"
              >
                <Link    
                  href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Github className="h-5 w-5" />
                  Install GitHub App
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <p className="text-center text-muted-foreground text-sm mt-4">
              You'll be redirected to GitHub to complete the installation
            </p>
          </motion.div>
        </div>

        {/* Why ContriFlow Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why ContriFlow?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the benefits of automated contributor rewards
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What Happens Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">What happens next?</CardTitle>
                <CardDescription>
                  Here's what you can expect during the setup process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">GitHub Authorization</h4>
                        <p className="text-sm text-muted-foreground">
                          GitHub will ask you to authorize our app for your organization
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Repository Selection</h4>
                        <p className="text-sm text-muted-foreground">
                          Choose which repositories you want to include in the reward system
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Wallet Connection</h4>
                        <p className="text-sm text-muted-foreground">
                          Connect your organization's wallet to fund contributor rewards
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">Configure Rewards</h4>
                        <p className="text-sm text-muted-foreground">
                          Set up your reward rules and start motivating contributors
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Separator className="mb-8" />
          <p className="text-muted-foreground">
            Need help with installation? Check out our{' '}
            <a href="#" className="text-primary hover:underline transition-colors">
              documentation
            </a>{' '}
            or{' '}
            <a href="#" className="text-primary hover:underline transition-colors">
              contact support
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default InstallationNewPage;
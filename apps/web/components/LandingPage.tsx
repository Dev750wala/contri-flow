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
  Sparkles,
  TrendingUp,
  Lock,
  Activity,
} from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useFetchOrganizationsForOwner } from '@/hooks/useFetchOrganizationsForOwner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

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
    <div className="w-full overflow-hidden">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="fixed inset-0 w-screen h-screen z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute top-0 left-0 w-full h-full object-cover opacity-100 pointer-events-none"
          >
            <source src="/HomeVideoBackground.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="container mx-auto relative z-10 max-w-7xl px-6 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 w-fit"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium tracking-wide">
                  Decentralized • Transparent • Secure
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.1] text-white"
              >
                MergePay
                <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 bg-clip-text text-transparent">
                  Rewards That Scale
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-white/70 leading-relaxed max-w-xl"
              >
                Automated blockchain rewards for open-source contributors. Organizations fund repositories, developers get paid instantly—no intermediaries, no delays.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="px-8 py-6 text-base font-semibold bg-white text-slate-900 hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all"
                  onClick={handleGetStarted}
                  disabled={isButtonDisabled}
                >
                  {getButtonText()}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-base font-semibold bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
                  onClick={() => {
                    const section = document.getElementById('how-it-works');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  How It Works
                </Button>
              </motion.div>

              {/* Inline Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-8 pt-4"
              >
                {[
                  { value: '10K+', label: 'Contributors' },
                  { value: '$2M+', label: 'Distributed' },
                  { value: '500+', label: 'Projects' },
                ].map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right Column - Visual Element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Animated background elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl animate-pulse"></div>
                
                {/* Card stack effect */}
                <div className="relative space-y-4">
                  {[
                    { icon: Github, label: 'PR Merged', desc: '#1234', color: 'from-cyan-500 to-blue-500' },
                    { icon: Zap, label: 'Reward Sent', desc: '0.5 ETH', color: 'from-blue-500 to-purple-500' },
                    { icon: Shield, label: 'On-Chain', desc: 'Verified', color: 'from-purple-500 to-pink-500' },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + idx * 0.1 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 flex items-center gap-4 shadow-2xl"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{item.label}</div>
                        <div className="text-white/60 text-sm">{item.desc}</div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Statement - Modern Design */}
      <section className="py-20 md:py-32 bg-slate-50 relative">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-700 text-sm font-semibold mb-6">
                THE PROBLEM
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
                Open Source Contributors
                <span className="block text-slate-600">Deserve Better</span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                The current model leaves talented developers unrewarded, creating barriers to innovation and sustainable growth in the open-source ecosystem.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-700 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5"></div>
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-rose-400 mb-1">Traditional</div>
                      <div className="text-white/70 text-sm">Manual • Delayed • Opaque</div>
                    </div>
                    <ArrowRight className="h-8 w-8 text-cyan-400" />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-cyan-400 mb-1">MergePay</div>
                      <div className="text-white/70 text-sm">Automated • Instant • Transparent</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Lack of Incentives',
                description: 'Talented developers contribute for free, limiting participation and sustainable growth.',
                accentColor: 'rose',
              },
              {
                icon: Shield,
                title: 'No Transparency',
                description: 'Existing reward systems lack verifiable tracking and transparent distribution.',
                accentColor: 'amber',
              },
              {
                icon: Zap,
                title: 'Manual Overhead',
                description: 'No automated way to identify valuable contributions and distribute rewards.',
                accentColor: 'violet',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group"
              >
                <div className="bg-white p-8 h-full border-l-4 border-transparent hover:border-cyan-500 transition-all shadow-sm hover:shadow-md">
                  <div className={`w-12 h-12 bg-${item.accentColor}-100 flex items-center justify-center mb-4`}>
                    <item.icon className={`h-6 w-6 text-${item.accentColor}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Clean Process */}
      <section id="how-it-works" className="py-20 md:py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="container mx-auto px-6 md:px-8 max-w-7xl relative z-10">
          <div className="max-w-3xl mb-16">
            <div className="inline-block px-4 py-1.5 bg-cyan-500/20 text-cyan-300 text-sm font-semibold mb-6 border border-cyan-500/30">
              PLATFORM
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How MergePay Works
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed">
              Four simple steps from contribution to reward. Fully automated, completely transparent.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {[
              { step: '01', title: 'Connect GitHub', icon: Github, desc: 'Link your account securely' },
              { step: '02', title: 'Link Wallet', icon: Lock, desc: 'Web3 wallet integration' },
              { step: '03', title: 'Add Repositories', icon: GitBranch, desc: 'Select projects to fund' },
              { step: '04', title: 'Earn Rewards', icon: Coins, desc: 'Automatic ETH payouts' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative group"
              >
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-cyan-500/50 p-8 transition-all h-full">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="text-5xl font-bold text-slate-700 group-hover:text-cyan-500/30 transition-colors">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 bg-cyan-500/10 flex items-center justify-center mt-2">
                      <item.icon className="h-6 w-6 text-cyan-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.desc}</p>
                </div>
                
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-slate-700 to-transparent"></div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Github,
                title: 'GitHub Integration',
                description: 'Seamless sync with repositories',
              },
              {
                icon: Zap,
                title: 'AI Detection',
                description: 'Smart contribution analysis',
              },
              {
                icon: Shield,
                title: 'Blockchain Security',
                description: 'Transparent smart contracts',
              },
              {
                icon: Coins,
                title: 'Instant Payouts',
                description: 'Real-time ETH distribution',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-slate-800/30 border border-slate-700/50 p-6 hover:bg-slate-800/50 transition-all"
              >
                <feature.icon className="h-8 w-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack - Minimal Showcase */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="max-w-3xl mb-16">
            <div className="inline-block px-4 py-1.5 bg-cyan-100 text-cyan-700 text-sm font-semibold mb-6">
              TECHNOLOGY
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 leading-tight">
              Built With Industry-Leading Tech
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Leveraging cutting-edge blockchain and web technologies for security, scalability, and performance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Next.js', color: 'slate' },
              { name: 'TypeScript', color: 'blue' },
              { name: 'Solidity', color: 'purple' },
              { name: 'Ethereum', color: 'indigo' },
              { name: 'Chainlink', color: 'cyan' },
              { name: 'PostgreSQL', color: 'sky' },
            ].map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="group"
              >
                <div className="bg-white border-2 border-slate-200 hover:border-cyan-500 p-8 transition-all text-center h-full flex flex-col items-center justify-center">
                  <div className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                    {tech.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Clean & Direct */}
      <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
          >
            <source src="/EcosystemBackground.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="container mx-auto px-6 md:px-8 max-w-5xl relative z-10 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Start Rewarding Contributors Today
            </h2>
            
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of developers building the future of open source with fair, automated rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="px-10 py-6 text-lg font-semibold bg-white text-slate-900 hover:bg-slate-50 shadow-2xl transition-all"
                onClick={handleGetStarted}
                disabled={isButtonDisabled}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="px-10 py-6 text-lg font-semibold bg-transparent border-2 border-white text-white hover:bg-white/10"
                onClick={() => router.push('/auth/sign-in')}
              >
                View Documentation
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/90 border-t border-white/20 pt-12">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <span className="font-medium">10,000+ Developers</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-3">
                <Coins className="h-5 w-5" />
                <span className="font-medium">$2M+ Distributed</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5" />
                <span className="font-medium">100% On-Chain</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

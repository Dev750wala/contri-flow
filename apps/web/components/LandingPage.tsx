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
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
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

        <div className="container mx-auto text-center relative z-10 max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <p className="text-white/90 text-sm md:text-base font-medium tracking-wide">
              Decentralized • Transparent • Secure
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="text-white bg-clip-text">
              MergePay
            </span>
              
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Revolutionize open-source contributions with{' '}
            <span className="text-cyan-300 font-medium">automated rewards</span>.
            <br />
            Organizations fund, contributors earn—all on the blockchain.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex justify-center items-center mb-20"
          >
            <Button
              size="lg"
              className="relative px-12 py-8 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] border-x border-t-2 border-white/50 shadow-lg transition-all overflow-visible"
              onClick={handleGetStarted}
              disabled={isButtonDisabled}
            >
              {/* Decorative sparkle/star icon in top right */}
              <svg 
                width="40" 
                height="40" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 34 34" 
                className="absolute right-0 top-0 -translate-y-1/2 translate-x-1 rotate-45 pointer-events-none" 
                fill="none"
              >
                <g filter="url(#filter1_f)">
                  <circle cx="17" cy="17" r="2.8" fill="white" />
                </g>
                <path 
                  d="M17 4.94L17.38 16.07L20.95 13.05L17.93 16.61L29.06 17L17.93 17.38L20.95 20.95L17.38 17.93L17 29.06L16.62 17.93L13.05 20.95L16.07 17.38L4.94 17L16.07 16.61L13.05 13.05L16.62 16.07L17 4.94Z" 
                  fill="white" 
                  fillOpacity="0.7"
                />
                <defs>
                  <filter id="filter1_f" x="6.6" y="6.6" width="20.8" height="20.8" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="3.8" result="effect1_foregroundBlur" />
                  </filter>
                </defs>
              </svg>
              
              <span className="relative z-10">
                {getButtonText()}
              </span>
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {[
              { value: '10K+', label: 'Active Contributors', icon: Users },
              { value: '$2M+', label: 'Rewards Distributed', icon: Coins },
              { value: '500+', label: 'Projects Funded', icon: GitBranch },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="gap-5"
              >
                <stat.icon className="h-10 w-10 text-cyan-300 mb-4 mx-auto" />
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/70 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem Statement - Modern Design */}
      <section className="py-32 bg-gradient-to-b from-white via-cyan-50/30 to-white relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 px-5 py-2 bg-sky-100 text-sky-700 border-0">
              The Challenge
            </Badge>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Open Source Deserves
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                Better Incentives
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Traditional contribution models leave developers unrewarded,
              <br className="hidden md:block" />
              hindering innovation and collaboration in the ecosystem.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                title: 'Lack of Incentives',
                description: 'Talented developers contribute for free, limiting high-quality participation and sustainable growth.',
                gradient: 'from-rose-500 to-pink-600',
                bgGradient: 'from-rose-50 to-pink-50',
              },
              {
                icon: Shield,
                title: 'No Transparency',
                description: 'Existing reward systems lack verifiable tracking and transparent distribution mechanisms.',
                gradient: 'from-amber-500 to-orange-600',
                bgGradient: 'from-amber-50 to-orange-50',
              },
              {
                icon: Zap,
                title: 'Manual Overhead',
                description: 'No automated way to identify valuable contributions and distribute rewards efficiently.',
                gradient: 'from-violet-500 to-purple-600',
                bgGradient: 'from-violet-50 to-purple-50',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="group relative overflow-hidden border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-sky-200/60 transition-all duration-500 hover:-translate-y-3 bg-white rounded-3xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <CardHeader className="relative z-10 pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800 mb-3">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-slate-600 leading-relaxed text-lg">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Premium Design */}
      <section className="py-32 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 text-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(2,132,199,0.12),transparent_60%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 px-5 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              How It Works
            </Badge>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                Automated. Secure.
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                Decentralized.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-sky-100/80 max-w-3xl mx-auto leading-relaxed font-light">
              From contribution detection to reward distribution,
              <br className="hidden md:block" />
              everything happens automatically on-chain.
            </p>
          </motion.div>

          {/* Process Steps */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'GitHub Login', icon: Github, desc: 'Connect your account' },
                { step: '02', title: 'Link Wallet', icon: Lock, desc: 'Secure Web3 connection' },
                { step: '03', title: 'Add Repos', icon: GitBranch, desc: 'Select projects' },
                { step: '04', title: 'Fund & Earn', icon: TrendingUp, desc: 'Automatic rewards' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="relative"
                >
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                  )}
                  <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-cyan-400/20 hover:border-cyan-400/40 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 relative z-10">
                    <div className="text-5xl font-bold bg-gradient-to-br from-cyan-400 to-sky-500 bg-clip-text text-transparent mb-4">
                      {item.step}
                    </div>
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-sky-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-cyan-200/70">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Grid - New Modern Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: Github,
                title: 'GitHub Integration',
                description: 'Seamless sync with your repositories and PRs',
                gradient: 'from-slate-700 to-slate-800',
              },
              {
                icon: Zap,
                title: 'AI Detection',
                description: 'Smart bot identifies valuable contributions',
                gradient: 'from-cyan-600 to-cyan-700',
              },
              {
                icon: Shield,
                title: 'Blockchain Security',
                description: 'Transparent, verifiable smart contracts',
                gradient: 'from-cyan-600 to-sky-600',
              },
              {
                icon: Coins,
                title: 'Instant Rewards',
                description: 'Real-time ETH distribution to contributors',
                gradient: 'from-sky-600 to-blue-600',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="group bg-white/5 backdrop-blur-sm border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all duration-500 rounded-3xl overflow-hidden h-full">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white mb-2">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-cyan-200/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack - Premium Showcase */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <Badge className="mb-6 px-5 py-2 bg-cyan-100 text-cyan-700 border-0">
              Technology Stack
            </Badge>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Powered by
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                Cutting-Edge Tech
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
              Built with the most advanced blockchain and
              <br className="hidden md:block" />
              web technologies for maximum security and performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Next.js', gradient: 'from-black to-slate-700', icon: '⚡' },
              { name: 'TypeScript', gradient: 'from-blue-600 to-blue-700', icon: 'TS' },
              { name: 'Solidity', gradient: 'from-purple-600 to-purple-700', icon: '◆' },
              { name: 'Ethereum', gradient: 'from-violet-600 to-indigo-600', icon: 'Ξ' },
              { name: 'Chainlink', gradient: 'from-cyan-600 to-blue-600', icon: '🔗' },
              { name: 'PostgreSQL', gradient: 'from-sky-600 to-cyan-600', icon: '🐘' },
            ].map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="group text-center border-0 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-cyan-200/60 hover:-translate-y-3 transition-all duration-500 bg-white rounded-3xl overflow-hidden">
                  <CardContent className="py-10 px-4">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${tech.gradient} rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      {tech.icon}
                    </div>
                    <div className="text-lg font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
                      {tech.name}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Epic Finale */}
      <section className="relative py-40 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-sky-500 to-blue-600"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-sky-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Badge className="mb-8 px-6 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2 inline-block" />
              Join the Revolution
            </Badge>
            
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 text-white leading-tight">
              Ready to Transform
              <br />
              <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                Open Source Forever?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-16 text-white/90 max-w-3xl mx-auto leading-relaxed font-light">
              Be part of the future where every contribution counts
              <br className="hidden md:block" />
              and every contributor gets rewarded fairly.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="group relative overflow-hidden px-12 py-8 text-xl font-bold bg-white text-cyan-600 hover:bg-cyan-50 shadow-2xl hover:shadow-white/30 transition-all duration-500 rounded-2xl"
                onClick={handleGetStarted}
                disabled={isButtonDisabled}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Launch App
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-sky-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="px-12 py-8 text-xl font-bold bg-transparent border-2 border-white text-white hover:bg-white hover:text-cyan-600 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl"
                onClick={() => router.push('/auth/sign-in')}
              >
                Learn More
              </Button>
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 border-2 border-white"
                    ></div>
                  ))}
                </div>
                <span className="font-medium">10,000+ developers</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">$2M+ distributed</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="font-medium">100% on-chain</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

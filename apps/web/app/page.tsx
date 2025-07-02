'use client';

import { useSession } from 'next-auth/react';
import Navbar from '@/components/navbar';
import { LampContainer } from '@/components/ui/lamp';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import StatsSection from '@/components/landing/StatsSection';
import CTASection from '@/components/landing/CTASection';
import { Wallet, Star, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: <Wallet className="h-6 w-6" />,
    title: 'Crypto Rewards',
    description:
      'Automatically distribute crypto rewards to contributors when their PRs are merged.',
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: 'Bounty System',
    description:
      'Set bounties for issues and reward contributors based on their contributions.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Community Driven',
    description:
      'Build a thriving community of contributors motivated by fair rewards.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Instant Payouts',
    description:
      'Automated payouts ensure contributors receive their rewards instantly.',
  },
];

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-[#081336] via-[#14143a] to-[#1d2138] text-white overflow-x-hidden">
      {/* Animated Background Blobs */}
      {/* ... keep your animated blobs here ... */}
      <Navbar />
      <HeroSection session={session} />
      <FeaturesSection features={features} />
      <StatsSection />
      <CTASection session={session} />
      <LampContainer>
        <h1 className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          Join the Future of Open Source
        </h1>
      </LampContainer>
    </div>
  );
}

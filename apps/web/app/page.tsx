'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, Code, CheckCircle, Github, Star, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import './globals.css';
import TagButton from '@/components/tag-button';
import { LampContainer } from '@/components/ui/lamp';
import Navbar from '@/components/navbar';

const features = [
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Crypto Rewards",
    description: "Automatically distribute crypto rewards to contributors when their PRs are merged."
  },
  {
    icon: <Star className="h-6 w-6" />,
    title: "Bounty System",
    description: "Set bounties for issues and reward contributors based on their contributions."
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Community Driven",
    description: "Build a thriving community of contributors motivated by fair rewards."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Instant Payouts",
    description: "Automated payouts ensure contributors receive their rewards instantly."
  }
];

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-[#081336] via-[#14143a] to-[#1d2138] text-white overflow-x-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="pointer-events-none fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-700/30 blur-3xl z-0"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="pointer-events-none fixed bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/40 blur-3xl z-0"
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="pointer-events-none fixed top-[30%] left-[60%] w-[350px] h-[350px] rounded-full bg-indigo-800/30 blur-2xl z-0"
        animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Navbar />

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-32 text-center relative z-10"
      >
        <div className="max-w-4xl mx-auto">
          <TagButton />
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-cyan-200 sm:text-7xl drop-shadow-lg">
            Reward Open Source
            <span className="block text-cyan-600">
              Contributors with Crypto
            </span>
          </h1>
          <p className="mt-6 text-lg text-cyan-100/80">
            Automate crypto rewards for open source contributions. When PRs are
            merged, contributors can instantly claim their bounties through our
            secure platform.
          </p>
          <div className="mt-10 flex items-center gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
              <Link href={session ? "/dashboard" : "/auth/sign-in"}>
                <Button
                  size="lg"
                  className="gap-2 bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
              <Link href="https://github.com/your-repo" target="_blank">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-cyan-400 text-cyan-400 hover:bg-cyan-900/30 transition"
                >
                  <Github className="h-4 w-4" /> View on GitHub
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 hover:border-cyan-400/40 transition-colors"
            >
              <div className="text-cyan-400 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-cyan-100/60">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-2xl bg-black/20 backdrop-blur-sm"
          >
            <div className="text-4xl font-bold text-cyan-400 mb-2">$1M+</div>
            <div className="text-cyan-100/60">Total Rewards Distributed</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-2xl bg-black/20 backdrop-blur-sm"
          >
            <div className="text-4xl font-bold text-cyan-400 mb-2">10K+</div>
            <div className="text-cyan-100/60">Active Contributors</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-2xl bg-black/20 backdrop-blur-sm"
          >
            <div className="text-4xl font-bold text-cyan-400 mb-2">500+</div>
            <div className="text-cyan-100/60">Projects Supported</div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
        >
          <h2 className="text-3xl font-bold text-cyan-200 mb-4">
            Ready to Start Contributing?
          </h2>
          <p className="text-cyan-100/80 mb-8">
            Join our community of contributors and start earning rewards for your open source contributions.
          </p>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
            <Link href={session ? "/dashboard" : "/auth/sign-in"}>
              <Button
                size="lg"
                className="gap-2 bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
              >
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <LampContainer>
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut',
          }}
          className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
        >
          Join the Future of Open Source
        </motion.h1>
      </LampContainer>
    </div>
  );
}

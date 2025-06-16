'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wallet, Code, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import './globals.css';
import TagButton from '@/components/tag-button';
import { LampContainer } from '@/components/ui/lamp';

export default function Home() {
  return (
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-[#04091a] via-[#0d0d26] to-[#0b0d18] text-white overflow-x-hidden shadow-2xl">
      <div className='h-[100vh]'>
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

        {/* Navigation */}
        <nav className="w-full fixed top-0 left-0 z-50 bg-transparent backdrop-blur-md border-b-cyan-400 bg-gradient-to-b from-black/60 via-black/30 to-transparent px-0">
          <div className="container mx-auto flex flex-wrap items-center justify-between py-6 px-6 md:py-8 md:px-10">
            <div className="flex items-center space-x-2">
              <Code className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">Contri-Flow</span>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button
                variant="ghost"
                className="hover:bg-cyan-900/30 transition"
              >
                Login
              </Button>
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button className="bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition">
                  Get Started
                </Button>
              </motion.div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.section className="container mt-28 mx-auto px-6 py-32 text-center relative z-10 my-10">
          <div>
            <TagButton />

            <h1 className="text-5xl font-bold tracking-tight text-cyan-200 sm:text-8xl drop-shadow-lg">
              Reward Open Source
              <span className="block text-cyan-600">
                Contributors with Crypto
              </span>
            </h1>
          </div>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-cyan-100/80">
            Automate crypto rewards for open source contributions. When PRs are
            merged, contributors can instantly claim their bounties through our
            secure platform.
          </p>
          <div className="mt-10 flex items-center gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="gap-2 bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-cyan-400 text-cyan-400 hover:bg-cyan-900/30 transition"
              >
                View on GitHub
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </div>

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
          Build lamps <br /> the right way
        </motion.h1>
      </LampContainer>
    </div>
  );
}

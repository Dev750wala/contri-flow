'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Zap, Coins, Users, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CryzeoAnimatedBackground from '@/components/CryzeoAnimatedBackground';
import WalletConnectModal from '@/components/modal/walletConnectModal';
import Navbar from '@/components/MainNavbar';
import Link from 'next/link';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    const main = mainRef.current;
    if (main) {
      main.style.scrollBehavior = 'smooth';
      main.style.willChange = 'transform'; // Optimize for scrolling
    }
    return () => {
      if (main) {
        main.style.scrollBehavior = '';
        main.style.willChange = '';
      }
    };
  }, []);

  const handleConnectWallet = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-950 text-white">
      <CryzeoAnimatedBackground />
      <Navbar handleConnectWallet={handleConnectWallet} />
      <WalletConnectModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <main ref={mainRef} className="relative z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          className="py-12 sm:py-16 md:py-20 lg:py-24 text-center flex flex-col items-center justify-center px-4"
          id="home"
        >
          <Badge variant="secondary" className="mb-4 text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1">
          Decentralized • Transparent • Secure
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-tight px-2">
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
              MergePay
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 md:mb-12 max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed px-4">
          A decentralized platform that automatically rewards open-source contributors with ETH based on merged pull requests. Transparent, secure, and built on blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-10 sm:mb-12 md:mb-16 px-4">
            <Link
              href={'/dashboard'}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-2 text-base sm:text-lg rounded-2xl font-semibold border-0 hover:from-cyan-600 hover:to-emerald-600 w-full sm:w-auto"
            >
              Get Started
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-cyan-400/30 text-cyan-400 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg hover:bg-cyan-400/10 w-full sm:w-auto"
            >
              Watch Demo
            </Button>
          </div>
          <div className="flex flex-col items-center space-y-3 sm:space-y-4 mb-10 sm:mb-12 md:mb-16">
            <div className="text-xs sm:text-sm text-gray-400">They trust us</div>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">4.9</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-400 mb-1 sm:mb-2">
                $12.5B+
              </div>
              <div className="text-gray-400 text-sm sm:text-base">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-400 mb-1 sm:mb-2">
                $3.2B
              </div>
              <div className="text-gray-400 text-sm sm:text-base">24h Trading</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400 mb-1 sm:mb-2">
                2M+
              </div>
              <div className="text-gray-400 text-sm sm:text-base">Active Users</div>
            </div>
          </div>
        </motion.section>

        {/* Why Choose Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          className="py-12 sm:py-16 px-4"
          id="about"
        >
          <div className="text-center mb-12 sm:mb-16 max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Why Choose MergePay?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-2">
              Simplicity, performance, and security, empowering you to navigate the digital world
              with confidence and agility.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {[
              { icon: Shield, title: 'Maximum Security', description: 'Your assets are protected with cutting-edge security protocols.' },
              { icon: Zap, title: 'Instant Transactions', description: 'Execute your transactions in real-time, without delays.' },
              { icon: Coins, title: 'Optimized Fees', description: 'Benefit from some of the lowest fees on the market.' },
              { icon: Users, title: 'Premium Interface', description: 'An elegant, intuitive design that\'s easy to use, even for beginners.' },
            ].map((feature, index) => (
              <Card
                key={index}
                className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300 group"
              >
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* All Cryptos Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          className="py-12 sm:py-16 bg-muted/20 px-4"
          id="price"
        >
          <div className="text-center mb-12 sm:mb-16 max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              All Cryptos, One Platform
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-2">
              Buy, sell, and convert all major cryptocurrencies on a single platform. A seamless
              experience with no compromises.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-7xl mx-auto">
            {[
              { name: 'Bitcoin', symbol: 'BTC', price: '94,595.33', change: '+1.71', positive: true },
              { name: 'Ethereum', symbol: 'ETH', price: '2,609.21', change: '+1.71', positive: true },
              { name: 'Solana', symbol: 'SOL', price: '194.46', change: '-0.65', positive: false },
              { name: 'Dash', symbol: 'DASH', price: '24.68', change: '+1.71', positive: true },
              { name: 'XRP', symbol: 'XRP', price: '2.407', change: '+1.66', positive: true },
            ].map((crypto, index) => (
              <Card
                key={index}
                className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm hover:bg-slate-900/70 transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-base sm:text-lg font-bold mb-2">{crypto.name}</div>
                  <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-2 sm:mb-3">
                    ${crypto.price}
                  </div>
                  <Badge
                    className={`${
                      crypto.positive
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'
                        : 'bg-red-500/20 text-red-400 border-red-400/30'
                    } border text-xs sm:text-sm`}
                  >
                    {crypto.positive ? '+' : ''}{crypto.change}%
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold border-0 hover:from-cyan-600 hover:to-emerald-600"
            >
              Buy crypto now
            </Button>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          className="py-16"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A simple, fast, and secure platform to manage your cryptocurrencies in just a few
              steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 px-5">
            {[
              { step: '1', title: 'GitHub Login', description: 'Sign in with your GitHub account to get started and link your contributions.', icon: '🐙' },
              { step: '2', title: 'Connect Wallet', description: 'Securely connect your crypto wallet to receive and manage rewards.', icon: '🔗' },
              { step: '3', title: 'Add Repositories', description: 'Select and add the repositories you want to track for contributions.', icon: '📁' },
              { step: '4', title: 'Deposit ETH', description: 'Fund your reward pool by depositing ETH for automated distribution.', icon: '💸' },
            ].map((step, index) => (
              <Card
                key={index}
                className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm hover:bg-slate-900/70 max-w-sm p-1 transition-all duration-300 text-center"
              >
                <CardContent className="p-6">
                  <div className="text-6xl mb-6">{step.icon}</div>
                  <div className="w-12 h-12 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-16">
            <Button
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-8 py-4 text-lg font-semibold border-0 hover:from-cyan-600 hover:to-emerald-600"
            >
              Create account now
            </Button>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-5">
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-6 bg-slate-800/70 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🐱</span>
                </div>
                <h3 className="text-xl font-bold mb-4">GitHub Integration</h3>
                <p className="text-gray-400 leading-relaxed">Seamless integration with GitHub repositories and pull request monitoring.</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-6 bg-slate-800/70 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Auto Detection</h3>
                <p className="text-gray-400 leading-relaxed">AI bot automatically detects reward-worthy contributions and generates vouchers.</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-6 bg-slate-800/70 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-xl font-bold mb-4">Blockchain Secure</h3>
                <p className="text-gray-400 leading-relaxed">Smart contracts ensure secure, transparent, and verifiable reward distribution.</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm text-center">
              <CardContent className="p-8">
                <div className="w-12 h-12 mx-auto mb-6 bg-slate-800/70 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-xl font-bold mb-4">ETH Rewards</h3>
                <p className="text-gray-400 leading-relaxed">Contributors receive ETH rewards with real-time USD to ETH conversion.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Testimonials */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 bg-muted/20"
          id="blog"
        >
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Crypto Enthusiasts Worldwide
            </h2>
            <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto">
              Join a growing community of investors who choose MergePay for its seamless experience,
              security, and premium design.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { quote: "MergePay makes crypto trading effortless. Fast transactions, low fees, and a sleek interface—exactly what I needed.", author: "Alex M.", title: "Blockchain Analyst at NovaChain" },
                { quote: "Secure, fast, and seamless crypto trading. MergePay makes digital assets effortless.", author: "Priya S.", title: "Crypto Investor" },
                { quote: "The best platform for managing all my cryptocurrencies in one place.", author: "John D.", title: "Web3 Developer" },
              ].map((testimonial, index) => (
                <Card key={index} className="bg-slate-900/50 border-slate-800/50 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <p className="text-lg italic mb-6 text-gray-300">"{testimonial.quote}"</p>
                    <div className="font-bold text-white">{testimonial.author}</div>
                    <div className="text-cyan-400 text-sm">{testimonial.title}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.2 }}
          className="py-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to take control of your crypto?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of users who trust MergePay for secure, seamless, and efficient
            cryptocurrency transactions. Start now and unlock the full potential of digital assets.
          </p>
          <Link
            href={'/dashboard'}
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-12 py-6 text-xl font-semibold border-0 hover:from-cyan-600 hover:to-emerald-600 rounded-full"
          >
            Get started now
          </Link>
        </motion.section>
      </main>
    </div>
  );
}
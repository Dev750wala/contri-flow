'use client';

import { Button } from '@/components/ui/button';
import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { LampContainer } from '@/components/ui/lamp';
import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';

const SignInPage = () => {
  const { data: sessionData, status } = useSession();
  if (status === 'authenticated') {
    redirect('/', RedirectType.replace);
  }

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

      <div className="container relative z-10 mx-auto px-4 py-16">
        <div className="flex min-h-[80vh] flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8 rounded-2xl bg-black/20 p-8 backdrop-blur-lg"
          >
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-cyan-200">
                Welcome to Contri-Flow
              </h2>
              <p className="mt-2 text-sm text-cyan-100/80">
                Sign in to start contributing and earning rewards
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <motion.div className="w-full">
                <Button
                  onClick={() => {
                    signIn('github', {
                      redirect: false,
                      callbackUrl: '/',
                    });
                  }}
                  className="w-full cursor-pointer gap-2 bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
                  size="lg"
                >
                  <FaGithub className="h-5 w-5" />
                  Continue with GitHub
                </Button>
              </motion.div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/30"></div>
                </div>
                <div className="relative flex justify-center text-sm ">
                  <span className="bg-transparent px-2 text-cyan-100/60">
                    The future of open source rewards
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-cyan-100/60">
                <p>
                  By signing in, you agree to our{' '}
                  <Link
                    href="https://youtu.be/dQw4w9WgXcQ"
                    referrerPolicy="no-referrer"
                    target="_blank"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="https://youtu.be/dQw4w9WgXcQ"
                    referrerPolicy="no-referrer"
                    target="_blank"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;

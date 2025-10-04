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
    <div className="relative min-h-screen font-sans bg-gradient-to-br from-background via-background to-muted/20 text-foreground overflow-x-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="pointer-events-none fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl z-0"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="pointer-events-none fixed bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-3xl z-0"
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
            className="w-full max-w-md space-y-8 rounded-2xl bg-card/50 backdrop-blur-lg border border-border shadow-xl"
          >
            <div className="text-center p-8 pb-0">
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                Welcome to Contri-Flow
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to start contributing and earning rewards
              </p>
            </div>

            <div className="px-8 pb-8 space-y-6">
              <motion.div className="w-full">
                <Button
                  onClick={() => {
                    signIn('github', {
                      redirect: false,
                      callbackUrl: '/',
                    });
                  }}
                  className="w-full cursor-pointer gap-2 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
                  size="lg"
                >
                  <FaGithub className="h-5 w-5" />
                  Continue with GitHub
                </Button>
              </motion.div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm ">
                  <span className="bg-card px-2 text-muted-foreground">
                    The future of open source rewards
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                  By signing in, you agree to our{' '}
                  <Link
                    href="https://youtu.be/dQw4w9WgXcQ"
                    referrerPolicy="no-referrer"
                    target="_blank"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="https://youtu.be/dQw4w9WgXcQ"
                    referrerPolicy="no-referrer"
                    target="_blank"
                    className="text-primary hover:text-primary/80 transition-colors"
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

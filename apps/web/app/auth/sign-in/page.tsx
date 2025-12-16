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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 w-screen h-screen z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        >
          <source src="/HomeVideoBackground.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      </div>

      {/* Ambient Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 py-16">
        <div className="flex min-h-[80vh] flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8 rounded-2xl bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 shadow-xl"
          >
            <div className="text-center p-8 pb-0">
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                Welcome to Contri-Flow
              </h2>
              <p className="mt-2 text-sm text-slate-300">
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
                  className="w-full cursor-pointer gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold hover:from-sky-600 hover:to-blue-700 transition"
                  size="lg"
                >
                  <FaGithub className="h-5 w-5" />
                  Continue with GitHub
                </Button>
              </motion.div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm ">
                  <span className="bg-slate-900/80 px-2 text-slate-400">
                    The future of open source rewards
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-slate-300">
                <p>
                  By signing in, you agree to our{' '}
                  <Link
                    href="https://youtu.be/dQw4w9WgXcQ"
                    referrerPolicy="no-referrer"
                    target="_blank"
                    className="text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="https://youtu.be/dQw4w9WgXcQ"
                    referrerPolicy="no-referrer"
                    target="_blank"
                    className="text-sky-400 hover:text-sky-300 transition-colors"
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

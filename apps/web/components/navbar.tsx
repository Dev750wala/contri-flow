'use client';

import { Code, LogOut, User, Settings, Github } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';

const Navbar = () => {
  const { data: sessionData, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-transparent backdrop-blur-md border-b-cyan-400 bg-gradient-to-b from-black/60 via-black/30 to-transparent px-0">
      <div className="container mx-auto flex flex-wrap items-center justify-between py-6 px-6 md:py-8 md:px-10">
        <Link href="/" className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-cyan-400" />
          <span className="text-2xl font-bold text-white">Contri-Flow</span>
        </Link>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {isLoading ? (
            // Show loading state with same dimensions to prevent layout shift
            <div className="h-10 w-[200px] animate-pulse bg-cyan-400/20 rounded-md" />
          ) : status === 'authenticated' ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="hover:bg-cyan-900/30 transition"
                >
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-cyan-900/30 transition-all duration-200 p-0"
                  >
                    {sessionData.user?.githubId ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_GITHUB_PROFILE_LINK?.replace('GITHUB_ID', sessionData.user.githubId)}`}
                        alt="User avatar"
                        height={40}
                        width={40}
                        className="rounded-full object-cover h-8 w-8"
                      />
                    ) : (
                      <Avatar className="h-10 w-10 border border-cyan-400/30">
                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-black font-semibold">
                          {sessionData.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-black/90 backdrop-blur-md border border-cyan-400/30 rounded-lg shadow-lg shadow-cyan-400/10"
                  align="end"
                  sideOffset={8}
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-cyan-400">
                      Signed in as
                    </p>
                    <p className="text-sm text-cyan-100 truncate">
                      {sessionData.user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-cyan-400/20" />
                  <DropdownMenuItem className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100">
                    <User className="h-4 w-4 text-cyan-400" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100">
                    <Settings className="h-4 w-4 text-cyan-400" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100">
                    <Github className="h-4 w-4 text-cyan-400" />
                    <span>GitHub</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-cyan-400/20" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 text-cyan-400" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in">
                <Button
                  variant="ghost"
                  className="hover:bg-cyan-900/30 transition"
                >
                  Login
                </Button>
              </Link>
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link href="/auth/sign-in">
                  <Button className="bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

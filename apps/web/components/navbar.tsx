'use client';

import { Code, LogOut, User, Settings, Github, Menu } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full sticky top-0 left-0 z-50 bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-xl border-b border-cyan-400/20 shadow-lg">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:py-6 md:px-10">
        <Link href="/" className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-cyan-400" />
          <span className="text-2xl font-bold text-white">Contri-Flow</span>
        </Link>
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoading ? (
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
                    className="relative h-11 w-11 rounded-full hover:bg-cyan-900/30 transition-all duration-200 p-0 border-2 border-cyan-400/30 shadow-cyan-400/10 shadow-md"
                  >
                    {sessionData.user?.githubId ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_GITHUB_PROFILE_LINK?.replace('GITHUB_ID', sessionData.user.githubId)}`}
                        alt="User avatar"
                        height={44}
                        width={44}
                        className="rounded-full object-cover h-11 w-11"
                      />
                    ) : (
                      <Avatar className="h-11 w-11 border border-cyan-400/30">
                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-black font-semibold">
                          {sessionData.user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-60 bg-black/95 backdrop-blur-lg border border-cyan-400/30 rounded-xl shadow-lg shadow-cyan-400/10 mt-2 p-0"
                  align="end"
                  sideOffset={12}
                >
                  {/* Pointer/arrow */}
                  <div className="absolute -top-2 right-6 w-4 h-4 bg-black/95 border-t border-l border-cyan-400/30 rotate-45 z-10" />
                  <div className="px-4 py-3 border-b border-cyan-400/10">
                    <p className="text-xs font-semibold text-cyan-400">
                      Signed in as
                    </p>
                    <p className="text-sm text-cyan-100 truncate">
                      {sessionData.user?.email}
                    </p>
                  </div>
                  <DropdownMenuItem className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100 mt-1">
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
                  <DropdownMenuSeparator className="bg-cyan-400/20 my-1" />
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100 mb-1"
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
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-cyan-400 hover:bg-cyan-900/30"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7" />
          </Button>
        </div>
        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 w-full bg-black/95 backdrop-blur-lg border-b border-cyan-400/20 z-50 md:hidden shadow-lg"
            >
              <div className="flex flex-col items-center py-4 space-y-2">
                {isLoading ? (
                  <div className="h-10 w-[200px] animate-pulse bg-cyan-400/20 rounded-md" />
                ) : status === 'authenticated' ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                    <div className="flex items-center gap-3 py-2">
                      {sessionData.user?.githubId ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_GITHUB_PROFILE_LINK?.replace('GITHUB_ID', sessionData.user.githubId)}`}
                          alt="User avatar"
                          height={36}
                          width={36}
                          className="rounded-full object-cover h-9 w-9 border border-cyan-400/30"
                        />
                      ) : (
                        <Avatar className="h-9 w-9 border border-cyan-400/30">
                          <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-black font-semibold">
                            {sessionData.user?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-cyan-100 font-semibold">
                        {sessionData.user?.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-cyan-100 hover:bg-cyan-900/30"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4 text-cyan-400 mr-2" /> Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link
                      href="/auth/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;

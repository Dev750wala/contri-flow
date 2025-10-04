'use client';

import {
  Code,
  LogOut,
  User,
  Settings,
  Github,
  Menu,
  Wallet,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import {
  Connector,
  useConnect,
  useAccount,
  useDisconnect,
  useBalance,
} from 'wagmi';
import { useTokenBalance } from '@/app/hooks/useGetTokenBalance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import config from '@/config';
import type { Sender as UserType } from '@/interfaces';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [userFromGithub, setUserFromGithub] = useState<UserType | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const { data: session, status } = useSession();
  const { connectors, connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { balance, isLoadingBalance } = useTokenBalance();

  useEffect(() => {
    const fetchGithubUser = async () => {
      if (session?.user?.github_id && !userFromGithub && !isLoadingUser) {
        setIsLoadingUser(true);
        try {
          const response = await fetch(
            `https://api.github.com/user/${session.user.github_id}`,
            {
              headers: {
                Accept: 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
              },
            }
          );
          if (response.ok) {
            const userData = (await response.json()) as UserType;
            setUserFromGithub(userData);
          }
        } catch (error) {
          console.error('Failed to fetch GitHub user:', error);
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    fetchGithubUser();
  }, [session?.user?.github_id, userFromGithub, isLoadingUser]);

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '/trade', label: 'Trade' },
    // Add more links here later
  ];

  return (
    <nav className="w-full sticky top-0 left-0 z-50 bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-xl border-b border-cyan-400/20 shadow-lg">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:py-6 md:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Wallet className="h-8 w-8 text-cyan-400" />
          <span className="text-2xl font-bold text-white">MergePay</span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-cyan-100 hover:text-cyan-400 transition-colors duration-200 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Authentication & Wallet Section - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {status === 'loading' ? (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-cyan-400/20 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-cyan-400/20 rounded animate-pulse"></div>
            </div>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-cyan-400/30 cursor-pointer bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-100 transition-all duration-200 flex items-center space-x-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-cyan-400 text-black text-xs font-semibold">
                      {userFromGithub?.avatar_url ? (
                        <Image
                          src={userFromGithub?.avatar_url}
                          alt="User Avatar"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        session.user?.name?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-24 truncate">
                    {userFromGithub?.login || session.user?.name || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-black/95 backdrop-blur-lg border border-cyan-400/30 rounded-xl shadow-lg shadow-cyan-400/10 mt-2 p-0"
                align="end"
                sideOffset={12}
              >
                <div className="px-4 py-3 border-b border-cyan-400/10">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-cyan-400 text-black text-sm font-semibold">
                        {userFromGithub?.avatar_url ? (
                          <Image
                            src={userFromGithub?.avatar_url}
                            alt="User Avatar"
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          session.user?.name?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-cyan-100 truncate">
                        {userFromGithub?.login || session.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-cyan-300 truncate">
                        {userFromGithub?.login ||
                          session.user?.email ||
                          'user@example.com'}
                      </p>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100 mx-1 my-1 px-4 py-2"
                  asChild
                >
                  <Link href="/profile">
                    <User className="h-4 w-4 text-cyan-400" />
                    <span>View Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100 mx-1 my-1 px-4 py-2"
                  asChild
                >
                  <Link href="/settings">
                    <Settings className="h-4 w-4 text-cyan-400" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-cyan-400/20 mx-1" />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100 mx-1 my-1 px-4 py-2"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 text-cyan-400" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => signIn()}
                variant="outline"
                className="border-cyan-400/30 cursor-pointer bg-transparent hover:bg-cyan-900/30 text-cyan-100 transition-all duration-200"
              >
                <User className="h-4 w-4 mr-2 text-cyan-400" />
                Sign In
              </Button>
            </motion.div>
          )}

          {/* Wallet Connection */}
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-cyan-400/30 cursor-pointer bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-100 transition-all duration-200"
                >
                  <Wallet className="h-4 w-4 mr-2 text-cyan-400" />
                  {shortenAddress(address || '')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60 bg-black/95 backdrop-blur-lg border border-cyan-400/30 rounded-xl shadow-lg shadow-cyan-400/10 mt-2 p-0"
                align="end"
                sideOffset={12}
              >
                <div className="px-4 py-3 border-b border-cyan-400/10">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-medium text-cyan-100 truncate">
                      {address
                        ? `${address.slice(0, 8)}...${address.slice(-6)}`
                        : ''}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-cyan-900/30"
                      onClick={() => copyToClipboard(address || '')}
                    >
                      {copiedAddress ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-cyan-400" />
                      )}
                    </Button>
                  </div>
                </div>
                <DropdownMenuItem className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-default focus:bg-cyan-900/30 focus:text-cyan-100 mx-1 my-1 px-4 py-2">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                  <span>
                    Balance:{' '}
                    {isLoadingBalance
                      ? 'Loading...'
                      : balance
                        ? `${Number(balance).toFixed(6)} MPT`
                        : '0 MPT'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-cyan-400/20 mx-1" />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-cyan-100 hover:bg-cyan-900/30 cursor-pointer focus:bg-cyan-900/30 focus:text-cyan-100 mx-1 my-1 px-4 py-2"
                  onClick={() => disconnect()}
                >
                  <LogOut className="h-4 w-4 text-cyan-400" />
                  <span>Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() =>
                  connect({ connector: connectors[0] as Connector })
                }
                className="bg-cyan-400 cursor-pointer text-black font-semibold hover:bg-cyan-300 transition-colors duration-200"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </motion.div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-cyan-400 hover:bg-cyan-900/30 cursor-pointer"
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
              <div className="flex flex-col items-center py-4 space-y-3">
                {/* Mobile Navigation Links */}
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-cyan-100 hover:text-cyan-400 transition-colors duration-200 font-medium py-2"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile Authentication */}
                <div className="border-t border-cyan-400/20 pt-3 w-full flex flex-col items-center space-y-2">
                  {status === 'loading' ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-cyan-400/20 rounded-full animate-pulse"></div>
                      <div className="h-4 w-20 bg-cyan-400/20 rounded animate-pulse"></div>
                    </div>
                  ) : session ? (
                    <>
                      <div className="flex items-center gap-3 py-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-cyan-400 text-black text-sm font-semibold">
                            {userFromGithub?.avatar_url ? (
                              <Image
                                src={userFromGithub?.avatar_url}
                                alt="User Avatar"
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              session.user?.email?.charAt(0)?.toUpperCase() ||
                              'U'
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-cyan-100 font-medium">
                            {session.user?.name || 'User'}
                          </span>
                          <span className="text-xs text-cyan-300">
                            {session.user?.email}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full cursor-pointer justify-center text-cyan-100 hover:bg-cyan-900/30"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          // Navigate to profile page
                        }}
                        asChild
                      >
                        <Link href="/profile">
                          <User className="h-4 w-4 text-cyan-400 mr-2" />
                          View Profile
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full cursor-pointer justify-center text-cyan-100 hover:bg-cyan-900/30"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut();
                        }}
                      >
                        <LogOut className="h-4 w-4 text-cyan-400 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signIn();
                      }}
                      variant="outline"
                      className="w-full cursor-pointer border-cyan-400/30 bg-transparent hover:bg-cyan-900/30 text-cyan-100 transition-all duration-200"
                    >
                      <User className="h-4 w-4 mr-2 text-cyan-400" />
                      Sign In
                    </Button>
                  )}
                </div>

                {/* Mobile Wallet Connection */}
                <div className="border-t border-cyan-400/20 pt-3 w-full flex flex-col items-center space-y-2">
                  {isConnected ? (
                    <>
                      <div className="flex items-center gap-3 py-2">
                        <Wallet className="h-5 w-5 text-cyan-400" />
                        <div className="flex flex-col">
                          <span className="text-cyan-100 font-medium">
                            {shortenAddress(address || '')}
                          </span>
                          <span className="text-xs text-cyan-300">
                            Balance:{' '}
                            {isLoadingBalance
                              ? 'Loading...'
                              : balance
                                ? `${Number(balance).toFixed(6)} MPT`
                                : '0 MPT'}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full cursor-pointer justify-center text-cyan-100 hover:bg-cyan-900/30"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          disconnect();
                        }}
                      >
                        <LogOut className="h-4 w-4 text-cyan-400 mr-2" />
                        Disconnect Wallet
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        connect({ connector: connectors[0] as Connector });
                      }}
                      className="w-full cursor-pointer bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition-colors duration-200"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;

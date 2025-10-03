'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowDownUp } from 'lucide-react';
import Navbar from '@/components/navbar';
import { useTradeToken } from '@/app/hooks/useTradeToken';

export default function DepositCard() {
  const {
    ethValue,
    tokenValue,
    isLoadingTokenAmount,
    handleAmountChange,
  } = useTradeToken();

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-md mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary to-accent opacity-25 blur-lg transition-all duration-1000 group-hover:opacity-50 group-hover:duration-200" />
            <Card className="relative transform-gpu transition-all duration-300 shadow-xl">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4 text-4xl font-bold font-headline">
                  Buy Tokens
                </CardTitle>
                <CardDescription>
                  Exchange ETH to Mergepay Token and deposit into your wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="usd-amount"
                      type="text"
                      placeholder="0.00"
                      value={ethValue}
                      onChange={handleAmountChange}
                      className="py-6 text-6xl font-bold pr-20 text-left border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center">
                      <span className="text-xl font-light tracking-wider text-foreground">
                        ETH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exchange Icon */}
                <div className="flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                    <ArrowDownUp className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      id="token-amount"
                      type="text"
                      placeholder="0.0"
                      value={tokenValue}
                      readOnly
                      className="py-6 text-6xl font-bold pr-20 text-left border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center">
                      <span className="text-xl font-light tracking-wider text-foreground">
                        MPT
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg">
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet & Buy
                  {
                    isLoadingTokenAmount ? ' (Calculating...)' : ''
                  }
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

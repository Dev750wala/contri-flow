'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Wallet, ArrowDownUp, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import Navbar from '@/components/navbar';
import { useTradeToken } from '@/app/hooks/useTradeToken';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export default function DepositCard() {
  const { 
    ethValue, 
    tokenValue,
    sellEthValue,
    sellTokenValue,
    isLoadingTokenAmount,
    isLoadingEthAmount,
    isConnecting,
    isTransactionSuccess,
    ethBalance,
    isLoadingBalance,
    isInsufficientBalance,
    handleAmountChange,
    handleSellAmountChange,
    handleBuyTokens,
    handleSellTokens
  } = useTradeToken();

  const { isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('buy');

  // Show success toast when transaction is successful
  useEffect(() => {
    if (isTransactionSuccess) {
      const action = activeTab === 'buy' ? 'Purchased' : 'Sold';
      const fromToken = activeTab === 'buy' ? 'ETH' : 'MPT';
      const toToken = activeTab === 'buy' ? 'MPT' : 'ETH';
      const fromValue = activeTab === 'buy' ? ethValue : sellTokenValue;
      const toValue = activeTab === 'buy' ? tokenValue : sellEthValue;
      
      toast.success(`🎉 Tokens ${action} Successfully!`, {
        description: `You've successfully ${action.toLowerCase()} ${toValue} ${toToken} tokens for ${fromValue} ${fromToken}`,
        duration: 5000,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });
    }
  }, [isTransactionSuccess, tokenValue, ethValue, sellTokenValue, sellEthValue, activeTab]);

  return (
    <>
      <Navbar />
      <div className="h-[85vh] flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-full max-w-md mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary to-accent opacity-25 blur-lg transition-all duration-1000 group-hover:opacity-50 group-hover:duration-200" />
            <Card className={`relative transform-gpu transition-all duration-300 shadow-xl ${
              isTransactionSuccess ? 'ring-2 ring-green-500 ring-opacity-50' : ''
            }`}>
              <CardHeader className="text-center">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-300 ${
                  isTransactionSuccess ? 'bg-green-500/10' : 'bg-primary/10'
                }`}>
                  {isTransactionSuccess ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : activeTab === 'buy' ? (
                    <TrendingUp className="h-8 w-8 text-primary" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-primary" />
                  )}
                </div>
                <CardTitle className="mt-4 text-4xl font-bold font-headline">
                  {isTransactionSuccess ? 'Success!' : 'Trade MergePay Tokens'}
                </CardTitle>
                <CardDescription>
                  {isTransactionSuccess 
                    ? `Successfully ${activeTab === 'buy' ? 'bought' : 'sold'} tokens!`
                    : `${activeTab === 'buy' ? 'Exchange ETH for MPT tokens' : 'Exchange MPT tokens for ETH'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                      value="buy" 
                      className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-sm"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Buy
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sell" 
                      className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:shadow-sm"
                    >
                      <TrendingDown className="h-4 w-4" />
                      Sell
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="buy" className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          id="eth-amount"
                          type="text"
                          placeholder="0.00"
                          value={ethValue}
                          onChange={handleAmountChange}
                          className={`py-6 text-3xl font-bold pr-20 text-left border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent ${
                            isInsufficientBalance ? 'text-red-500' : ''
                          }`}
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center">
                          <span className="text-xl font-light tracking-wider text-foreground">
                            ETH
                          </span>
                        </div>
                      </div>
                      
                      {/* Balance Display */}
                      <div className="flex justify-between items-center px-1">
                        <div className="text-sm text-muted-foreground">
                          {isConnected ? (
                            isLoadingBalance ? (
                              <span>Loading balance...</span>
                            ) : ethBalance ? (
                              <span>
                                Balance: {Number(ethBalance.formatted).toFixed(6)} ETH
                              </span>
                            ) : (
                              <span>Balance: 0 ETH</span>
                            )
                          ) : (
                            <span>Connect wallet to see balance</span>
                          )}
                        </div>
                        {isInsufficientBalance && (
                          <div className="text-sm text-red-500 font-medium">
                            Insufficient balance
                          </div>
                        )}
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
                          className="py-6 text-3xl font-bold pr-20 text-left border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center">
                          <span className="text-xl font-light tracking-wider text-foreground">
                            MPT
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sell" className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          id="sell-token-amount"
                          type="text"
                          placeholder="0.0"
                          value={sellTokenValue}
                          onChange={handleSellAmountChange}
                          className="py-6 text-3xl font-bold pr-20 text-left border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center">
                          <span className="text-xl font-light tracking-wider text-foreground">
                            MPT
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
                          id="sell-eth-amount"
                          type="text"
                          placeholder="0.00"
                          value={sellEthValue}
                          readOnly
                          className="py-6 text-3xl font-bold pr-20 text-left border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center">
                          <span className="text-xl font-light tracking-wider text-foreground">
                            ETH
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                {activeTab === 'buy' ? (
                  <Button 
                    className="w-full cursor-pointer" 
                    size="lg" 
                    onClick={handleBuyTokens}
                    disabled={isConnecting || isLoadingTokenAmount || (!ethValue && isConnected) || isInsufficientBalance}
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    <span>
                      {isConnecting 
                        ? 'Connecting...' 
                        : isInsufficientBalance
                          ? 'Insufficient Balance'
                        : isConnected 
                          ? (ethValue ? 'Buy Tokens' : 'Enter ETH Amount')
                          : 'Connect Wallet & Buy'
                      }
                    </span>
                    {isLoadingTokenAmount && !isConnecting ? ' (Calculating...)' : ''}
                  </Button>
                ) : (
                  <Button 
                    className="w-full cursor-pointer" 
                    size="lg" 
                    onClick={handleSellTokens}
                    disabled={isConnecting || isLoadingEthAmount || (!sellTokenValue && isConnected)}
                  >
                    <TrendingDown className="mr-2 h-5 w-5" />
                    <span>
                      {isConnecting 
                        ? 'Connecting...' 
                        : isConnected 
                          ? (sellTokenValue ? 'Sell Tokens' : 'Enter MPT Amount')
                          : 'Connect Wallet & Sell'
                      }
                    </span>
                    {isLoadingEthAmount && !isConnecting ? ' (Calculating...)' : ''}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

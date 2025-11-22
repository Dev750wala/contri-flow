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
import { Wallet, ArrowDownUp, CheckCircle, TrendingUp, TrendingDown, ArrowDown, Zap, ArrowRightLeft } from 'lucide-react';
import { useTradeToken } from '@/app/hooks/useTradeToken';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
    mptBalance,
    isLoadingMptBalance,
    isInsufficientBalance,
    isInsufficientMptBalance,
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
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans">
        {/* Ambient Background Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl z-10"
      >
        {/* Main Container - Horizontal Layout on Desktop */}
        <div className="relative group bg-slate-900/60 backdrop-blur-2xl border border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Decorative Border Glow */}
          <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 group-hover:ring-sky-500/30 transition-all duration-500" />

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            
            {/* LEFT PANEL: Visuals & Info (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-blue-900/40 to-slate-900/40 p-8 flex flex-col justify-between relative overflow-hidden">
              {/* Animated Grid Background */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-3xl rounded-full"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                    <Zap className="text-white h-5 w-5" fill="white" />
                  </div>
                  <span className="text-xl font-bold text-white tracking-tight">MergePay</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {activeTab === 'buy' ? 'Invest in the Future.' : 'Realize Your Gains.'}
                </h1>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                  {activeTab === 'buy' 
                    ? 'Seamlessly swap ETH for MPT tokens with instant execution and minimal slippage.' 
                    : 'Convert your MPT holdings back to ETH securely.'}
                </p>
              </div>

              {/* Dynamic Balance Visualizer */}
              <div className="relative z-10 mt-8 lg:mt-0 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">Current Holdings</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-200">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                      ETH
                    </div>
                    <span className="font-mono text-sky-300">
                      {isConnected && ethBalance ? Number(ethBalance.formatted).toFixed(4) : '0.00'}
                    </span>
                  </div>
                  <div className="h-px bg-slate-700/50 w-full" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-200">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                      MPT
                    </div>
                    <span className="font-mono text-blue-300">
                      {isConnected && mptBalance ? (Number(mptBalance) / 1e18).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: Interactive Form (7 cols) */}
            <div className="lg:col-span-7 p-6 md:p-8 bg-slate-950/30 flex flex-col justify-center relative">
              
              <AnimatePresence mode="wait">
                {isTransactionSuccess ? (
                  /* SUCCESS STATE */
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center h-full py-10"
                  >
                    <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 ring-1 ring-green-500/50">
                      <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Transaction Complete!</h2>
                    <p className="text-slate-400 max-w-xs mx-auto mb-8">
                      You successfully {activeTab === 'buy' ? 'bought MPT' : 'sold MPT'}. Your balance has been updated.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.reload()} 
                      className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      Start New Trade
                    </Button>
                  </motion.div>
                ) : (
                  /* FORM STATE */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Tabs Switcher */}
                    <div className="flex justify-center mb-4">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
                        <TabsList className="grid w-full grid-cols-2 bg-slate-900 p-1 h-12 rounded-xl border border-slate-800">
                          <TabsTrigger 
                            value="buy"
                            className="rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-sky-400 data-[state=active]:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              <span>Buy MPT</span>
                            </div>
                          </TabsTrigger>
                          <TabsTrigger 
                            value="sell"
                            className="rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <TrendingDown className="w-4 h-4" />
                              <span>Sell MPT</span>
                            </div>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Swap Inputs Container */}
                    <div className="relative space-y-1">
                      {/* Input 1 (Top) */}
                      <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors rounded-t-2xl rounded-b-lg p-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium uppercase">
                          <span>{activeTab === 'buy' ? 'You Pay' : 'You Sell'}</span>
                          <span className={`${(activeTab === 'buy' ? isInsufficientBalance : isInsufficientMptBalance) ? 'text-red-400' : ''}`}>
                            {activeTab === 'buy' 
                              ? `Max: ${isConnected && ethBalance ? Number(ethBalance.formatted).toFixed(4) : '0'}` 
                              : `Max: ${isConnected && mptBalance ? (Number(mptBalance)/1e18).toFixed(4) : '0'}`
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Input
                            type="text"
                            placeholder="0.00"
                            value={activeTab === 'buy' ? ethValue : sellTokenValue}
                            onChange={activeTab === 'buy' ? handleAmountChange : handleSellAmountChange}
                            className="bg-transparent border-none shadow-none text-3xl md:text-4xl font-bold text-white p-0 h-auto placeholder:text-slate-700 focus-visible:ring-0"
                          />
                          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 shrink-0">
                            <div className={`w-5 h-5 rounded-full ${activeTab === 'buy' ? 'bg-cyan-500' : 'bg-blue-600'}`} />
                            <span className="font-bold text-slate-200">{activeTab === 'buy' ? 'ETH' : 'MPT'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Connector/Divider */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="bg-slate-950 border-4 border-slate-950 rounded-xl p-1.5 shadow-xl">
                          <div className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors cursor-pointer">
                            <ArrowDown className="w-4 h-4 text-sky-500" />
                          </div>
                        </div>
                      </div>

                      {/* Input 2 (Bottom) */}
                      <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors rounded-b-2xl rounded-t-lg p-4 pt-6">
                         <div className="flex justify-between text-xs text-slate-500 mb-2 font-medium uppercase">
                          <span>You Receive</span>
                          <span>{activeTab === 'buy' ? 'Estimated MPT' : 'Estimated ETH'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Input
                            type="text"
                            placeholder="0.00"
                            readOnly
                            value={activeTab === 'buy' ? tokenValue : sellEthValue}
                            className="bg-transparent border-none shadow-none text-3xl md:text-4xl font-bold text-white p-0 h-auto placeholder:text-slate-700 focus-visible:ring-0"
                          />
                          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 shrink-0">
                             <div className={`w-5 h-5 rounded-full ${activeTab === 'buy' ? 'bg-blue-600' : 'bg-cyan-500'}`} />
                            <span className="font-bold text-slate-200">{activeTab === 'buy' ? 'MPT' : 'ETH'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Message Area */}
                    {(isInsufficientBalance || isInsufficientMptBalance) && (
                      <div className="text-red-400 text-sm text-center bg-red-950/30 py-2 rounded-lg border border-red-900/50">
                        Insufficient Balance
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      size="lg"
                      className={`
                        w-full py-8 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group
                        ${activeTab === 'buy' 
                          ? 'bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-600 hover:shadow-sky-500/25' 
                          : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:shadow-blue-500/25'
                        }
                      `}
                      onClick={activeTab === 'buy' ? handleBuyTokens : handleSellTokens}
                      disabled={
                        isConnecting || 
                        isLoadingTokenAmount || 
                        isLoadingEthAmount || 
                        (activeTab === 'buy' ? isInsufficientBalance : isInsufficientMptBalance) ||
                        (activeTab === 'buy' ? !ethValue : !sellTokenValue)
                      }
                    >
                      {isConnecting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Connecting Wallet...
                        </span>
                      ) : !isConnected ? (
                        <span className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          Connect Wallet
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          {activeTab === 'buy' ? 'Buy MPT' : 'Sell MPT'}
                          <ArrowRightLeft className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>

                    {/* Footer Info */}
                    <div className="flex justify-between items-center text-xs text-slate-500 px-2">
                      <span>Exchange Rate: 1 ETH ≈ 5,000 MPT</span>
                      <span>Gas: <span className="text-sky-400">~0.004 ETH</span></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>

    </div>
  );
}

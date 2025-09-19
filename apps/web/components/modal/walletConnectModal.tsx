// components/WalletConnectModal.jsx
'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WalletConnectModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const wallets = [
    { id: 1, name: 'MetaMask', icon: '🦊' },
    { id: 2, name: 'Coinbase Wallet', icon: 'ⓒ' },
    { id: 3, name: 'Kapir', icon: 'K' },
    { id: 4, name: 'WalletConnect', icon: '🔗' },
  ];

  const handleWalletSelect = (walletName) => {
    // TODO: Implement wallet connection logic here
    console.log(`Connecting to ${walletName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-sm mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-black">🔒</span>
            </div>
            <h2 className="text-lg font-semibold text-white">Connect Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wallet Options */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-4">Choose a wallet to connect:</p>
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                onClick={() => handleWalletSelect(wallet.name)}
                className="w-full flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{wallet.icon}</span>
                  <span className="text-white font-medium">{wallet.name}</span>
                </div>
                <span className="text-gray-400">›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-700">
          <Button
            variant="destructive"
            onClick={onClose}
            className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30 h-10"
          >
            Cancel
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white h-10"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </div>
  );
}
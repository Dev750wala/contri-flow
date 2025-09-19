import React from 'react'
import { Button } from './ui/button'

const Navbar = ({ handleConnectWallet }: { handleConnectWallet: () => void }) => {
  return (
    <div>
      <nav className="relative z-10 flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
          MergePay
        </div>
        <div className="hidden lg:flex space-x-6 xl:space-x-8">
          <a href="#home" className="text-gray-300 hover:text-white transition-colors">Home</a>
          <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
          <a href="#price" className="text-gray-300 hover:text-white transition-colors">Price</a>
          <a href="#blog" className="text-gray-300 hover:text-white transition-colors">Blog</a>
          <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact us</a>
        </div>
        <Button
          onClick={handleConnectWallet}
          className="bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 text-white border-0 hover:from-cyan-600 hover:to-teal-700 text-sm sm:text-base px-3 sm:px-4 py-2"
        >
          Connect Wallet
        </Button>
      </nav>
    </div>
  )
}

export default Navbar

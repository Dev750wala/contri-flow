'use client';

import React from 'react';
import { 
  DollarSign, 
  Link, 
  Users, 
  TrendingUp, 
  Plus, 
  Wallet,
  Eye,
  ExternalLink
} from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  bgColor: string;
}

interface Repository {
  name: string;
  botStatus: 'installed' | 'not-installed';
  webhookStatus: 'active' | 'inactive';
}

interface Voucher {
  id: string;
  repository: string;
  pr: string;
  issuedTo: string;
  avatar: string;
  amount: string;
  ethAmount: string;
  status: 'claimed' | 'issued';
  created: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, bgColor }) => (
  <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-800/50 backdrop-blur-sm shadow-sm">
    <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${bgColor} mb-3 sm:mb-4`}>
      {icon}
    </div>
    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-gray-300 text-xs sm:text-sm">{label}</div>
  </div>
);

const ActivityItem: React.FC<{ type: 'claimed' | 'issued' | 'deposit', text: string }> = ({ type, text }) => {
  const colors = {
    claimed: 'bg-emerald-500',
    issued: 'bg-cyan-500',
    deposit: 'bg-orange-500'
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 py-2">
      <div className={`w-2 h-2 rounded-full ${colors[type]}`}></div>
      <span className="text-gray-300 text-xs sm:text-sm">{text}</span>
    </div>
  );
};

const RepositoryCard: React.FC<{ repo: Repository, showInstallButton?: boolean }> = ({ 
  repo, 
  showInstallButton = false 
}) => (
  <div className="bg-slate-900/50 rounded-lg border border-slate-800/50 backdrop-blur-sm p-4 sm:p-5">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
      <div className="flex-1">
        <h3 className="font-medium text-white text-sm sm:text-base mb-2">{repo.name}</h3>
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            repo.botStatus === 'installed' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' 
              : 'bg-red-500/20 text-red-400 border-red-400/30'
          } border`}>
            Bot: {repo.botStatus === 'installed' ? 'Installed' : 'Not Installed'}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            repo.webhookStatus === 'active' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' 
              : 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30'
          } border`}>
            Webhook: {repo.webhookStatus === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      {showInstallButton && (
        <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-xs sm:text-sm rounded-md hover:from-cyan-600 hover:to-emerald-600 transition-colors w-full sm:w-auto">
          Install Bot
        </button>
      )}
    </div>
  </div>
);

const VoucherRow: React.FC<{ voucher: Voucher }> = ({ voucher }) => (
  <tr className="border-b border-slate-800/50 hover:bg-slate-900/70">
    <td className="py-3 sm:py-4 px-2 sm:px-4">
      <div className="font-medium text-white text-sm sm:text-base">{voucher.repository}</div>
      <div className="text-xs sm:text-sm text-gray-300">{voucher.pr}</div>
    </td>
    <td className="py-3 sm:py-4 px-2 sm:px-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-300">
          {voucher.avatar}
        </div>
        <span className="text-xs sm:text-sm text-gray-300">{voucher.issuedTo}</span>
      </div>
    </td>
    <td className="py-3 sm:py-4 px-2 sm:px-4">
      <div className="font-medium text-white text-sm sm:text-base">${voucher.amount}</div>
      <div className="text-xs sm:text-sm text-gray-300">{voucher.ethAmount}</div>
    </td>
    <td className="py-3 sm:py-4 px-2 sm:px-4">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
        voucher.status === 'claimed' 
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30' 
          : 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30'
      }`}>
        {voucher.status === 'claimed' ? 'Claimed' : 'Issued'}
      </span>
    </td>
    <td className="py-3 sm:py-4 px-2 sm:px-4">
      <span className="text-xs sm:text-sm text-gray-300">{voucher.created}</span>
    </td>
    <td className="py-3 sm:py-4 px-2 sm:px-4">
      <div className="flex items-center gap-2">
        <button className="p-1 hover:bg-slate-800/50 rounded">
          <Eye className="w-4 h-4 text-gray-300" />
        </button>
        <button className="p-1 hover:bg-slate-800/50 rounded">
          <ExternalLink className="w-4 h-4 text-gray-300" />
        </button>
      </div>
    </td>
  </tr>
);

const ContriFlowDashboard: React.FC = () => {
  const repositories: Repository[] = [
    {
      name: 'johndoe/awesome-project',
      botStatus: 'installed',
      webhookStatus: 'active'
    },
    {
      name: 'johndoe/react-components',
      botStatus: 'not-installed',
      webhookStatus: 'inactive'
    }
  ];

  const vouchers: Voucher[] = [
    {
      id: '42',
      repository: 'johndoe/awesome-project',
      pr: '#42 - Add user authentication feature',
      issuedTo: '@alice_dev',
      avatar: 'A',
      amount: '50',
      ethAmount: '0.021 ETH',
      status: 'claimed',
      created: 'Jan 20, 2024'
    },
    {
      id: '38',
      repository: 'johndoe/awesome-project',
      pr: '#38 - Fix responsive layout issues',
      issuedTo: '@bob_coder',
      avatar: 'B',
      amount: '25',
      ethAmount: '0.0104 ETH',
      status: 'issued',
      created: 'Jan 19, 2024'
    },
    {
      id: '15',
      repository: 'johndoe/react-components',
      pr: '#15 - Add new button variants',
      issuedTo: '@carol_ui',
      avatar: 'C',
      amount: '30',
      ethAmount: '0.0125 ETH',
      status: 'issued',
      created: 'Jan 18, 2024'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <div className="relative z-10">
        <header className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center py-4 sm:h-16">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </div>
                <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">ContriFlow</h1>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <button className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition-colors text-xs sm:text-sm">
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-700 rounded-full"></div>
                  <span className="text-gray-300 text-xs sm:text-sm">johndoe</span>
                  <ExternalLink className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Repository Owner Dashboard</h1>
            <p className="text-gray-300 text-sm sm:text-base">Manage your repositories and reward contributors</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />}
              value="0.0 ETH"
              label="Available Balance"
              bgColor="bg-cyan-500/20"
            />
            <StatCard
              icon={<Link className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />}
              value="3"
              label="Linked Repositories"
              bgColor="bg-emerald-500/20"
            />
            <StatCard
              icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />}
              value="24"
              label="Vouchers Issued"
              bgColor="bg-orange-500/20"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />}
              value="18"
              label="Vouchers Claimed"
              bgColor="bg-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-800/50 backdrop-blur-sm shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition-colors text-sm">
                    <Plus className="w-4 h-4" />
                    Link Repository
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-600 transition-colors text-sm">
                    <DollarSign className="w-4 h-4" />
                    Deposit Funds
                  </button>
                  <span className="text-xs sm:text-sm text-gray-300 self-center ml-0 sm:ml-2">
                    Connect wallet to deposit funds
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-800/50 backdrop-blur-sm shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Linked Repositories</h2>
                <div className="space-y-4">
                  {repositories.map((repo, index) => (
                    <RepositoryCard 
                      key={index} 
                      repo={repo} 
                      showInstallButton={repo.botStatus === 'not-installed'}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-800/50 backdrop-blur-sm shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Voucher Management</h2>
                  <select className="px-3 py-2 border border-slate-800 bg-slate-900 text-gray-300 rounded-md text-xs sm:text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option>All Status</option>
                    <option>Claimed</option>
                    <option>Issued</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="text-left border-b border-slate-800/50">
                        <th className="pb-3 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider px-2 sm:px-4">
                          Repository / PR
                        </th>
                        <th className="pb-3 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider px-2 sm:px-4">
                          Issued To
                        </th>
                        <th className="pb-3 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider px-2 sm:px-4">
                          Amount
                        </th>
                        <th className="pb-3 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider px-2 sm:px-4">
                          Status
                        </th>
                        <th className="pb-3 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider px-2 sm:px-4">
                          Created
                        </th>
                        <th className="pb-3 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider px-2 sm:px-4">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers.map((voucher) => (
                        <VoucherRow key={voucher.id} voucher={voucher} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="bg-slate-900/50 rounded-xl p-4 sm:p-6 border border-slate-800/50 backdrop-blur-sm shadow-sm">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div className="space-y-1">
                  <ActivityItem type="claimed" text="Voucher claimed by @alice" />
                  <ActivityItem type="issued" text="New voucher issued (#42)" />
                  <ActivityItem type="deposit" text="Deposit confirmed" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 sm:mt-12 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-end">
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-300">
                <span>Made in Bolt</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ContriFlowDashboard;
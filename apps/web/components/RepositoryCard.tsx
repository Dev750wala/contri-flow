'use client';

import React from 'react';
import { 
  GitBranch, 
  ExternalLink, 
  Users, 
  Coins, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  GitCommit
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface Maintainer {
  id: string;
  username: string;
  avatar?: string;
}

export interface RewardStats {
  totalDistributed: number;
  contributorsRewarded: number;
  currency: string;
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  githubUrl: string;
  lastActivity: {
    type: 'commit' | 'pr';
    date: string;
    branch?: string;
  };
  rewardsEnabled: boolean;
  rewardStats: RewardStats;
  maintainers: Maintainer[];
  tokenInfo: {
    symbol: string;
    address: string;
    name: string;
  };
  languages: {
    name: string;
    color: string;
  }[];
  webhookActive: boolean;
}

interface RepositoryCardProps {
  repository: Repository;
  onToggleRewards: (repoId: string, enabled: boolean) => void;
  onManageSettings: (repoId: string) => void;
  className?: string;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({
  repository,
  onToggleRewards,
  onManageSettings,
  className
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatCurrency = (amount: number, symbol: string) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ${symbol}`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K ${symbol}`;
    }
    return `${amount.toFixed(2)} ${symbol}`;
  };

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200 border-muted/40 hover:border-muted",
      "bg-gradient-to-br from-background via-background to-muted/5",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {repository.fullName}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <a 
                href={repository.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View on GitHub
              </a>
            </div>
          </div>
          <CardAction>
            <Badge 
              variant={repository.rewardsEnabled ? "default" : "outline"}
              className={cn(
                "text-xs cursor-pointer transition-all",
                repository.rewardsEnabled 
                  ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/30"
                  : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-gray-900/30"
              )}
              onClick={() => onToggleRewards(repository.id, !repository.rewardsEnabled)}
            >
              {repository.rewardsEnabled ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              {repository.rewardsEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Last Activity */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            {repository.lastActivity.type === 'commit' ? (
              <GitCommit className="h-4 w-4" />
            ) : (
              <GitBranch className="h-4 w-4" />
            )}
            <span>
              Last {repository.lastActivity.type} {formatDate(repository.lastActivity.date)}
              {repository.lastActivity.branch && (
                <span className="text-xs ml-1">
                  on <code className="bg-muted px-1 rounded">{repository.lastActivity.branch}</code>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Reward Stats */}
        {repository.rewardsEnabled && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Coins className="h-3 w-3" />
                Total Distributed
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(repository.rewardStats.totalDistributed, repository.rewardStats.currency)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                Contributors Rewarded
              </div>
              <div className="text-sm font-medium">
                {repository.rewardStats.contributorsRewarded}
              </div>
            </div>
          </div>
        )}

        {/* Languages */}
        {repository.languages.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Top Languages</div>
            <div className="flex items-center gap-2 flex-wrap">
              {repository.languages.slice(0, 3).map((language) => (
                <Badge 
                  key={language.name}
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: language.color,
                    color: language.color
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: language.color }}
                  />
                  {language.name}
                </Badge>
              ))}
              {repository.languages.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{repository.languages.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Maintainers */}
        {repository.maintainers.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Authorized Maintainers</div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {repository.maintainers.slice(0, 3).map((maintainer) => (
                  <div
                    key={maintainer.id}
                    className="relative h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                    title={maintainer.username}
                  >
                    {maintainer.avatar ? (
                      <img
                        src={maintainer.avatar}
                        alt={maintainer.username}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium">
                        {maintainer.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {repository.maintainers.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{repository.maintainers.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant={repository.rewardsEnabled ? "outline" : "default"}
            size="sm"
            onClick={() => onManageSettings(repository.id)}
            className="flex-1"
          >
            <Settings className="h-4 w-4" />
            {repository.rewardsEnabled ? 'Manage Settings' : 'Enable Rewards'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepositoryCard;
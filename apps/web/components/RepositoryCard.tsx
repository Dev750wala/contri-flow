'use client';

import React from 'react';
import { 
  ExternalLink, 
  Users, 
  CheckCircle, 
  XCircle, 
  Settings,
  Star,
  GitFork
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface Maintainer {
  id: string;
  username: string;
  avatar?: string;
}

export interface Repository {
  id: string;
  name: string;
  owner: string;
  fullName: string;
  githubUrl: string;
  rewardsEnabled: boolean;
  maintainers: Maintainer[];
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

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 border-2 backdrop-blur-lg",
      repository.rewardsEnabled 
        ? "border-green-500/50 bg-slate-900/80 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20"
        : "border-slate-700/50 bg-slate-900/80 hover:border-slate-600 hover:shadow-md",
      className
    )}>
      {/* Status indicator bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 transition-all duration-300",
        repository.rewardsEnabled 
          ? "bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"
          : "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"
      )} />

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-white group-hover:text-sky-400 transition-colors truncate">
                {repository.name}
              </CardTitle>
            </div>
            <div className="text-xs text-slate-400 font-mono truncate">
              {repository.fullName}
            </div>
          </div>
          <Badge 
            variant={repository.rewardsEnabled ? "default" : "outline"}
            className={cn(
              "text-xs font-medium cursor-pointer transition-all hover:scale-105 shrink-0",
              repository.rewardsEnabled 
                ? "bg-green-500 text-white border-green-600 hover:bg-green-600"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            )}
            onClick={() => onToggleRewards(repository.id, !repository.rewardsEnabled)}
          >
            {repository.rewardsEnabled ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-4">
        {/* GitHub Link */}
        <a 
          href={repository.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors group/link w-fit"
        >
          <ExternalLink className="h-3.5 w-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          <span className="group-hover/link:underline">View on GitHub</span>
        </a>

        {/* Maintainers Section */}
        {repository.maintainers.length > 0 && (
          <div className={cn(
            "p-3 rounded-lg border transition-colors",
            repository.rewardsEnabled
              ? "bg-green-500/10 border-green-500/50"
              : "bg-slate-800/60 border-slate-700"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Users className="h-3.5 w-3.5" />
                Maintainers
              </div>
              <span className="text-xs font-semibold text-white">
                {repository.maintainers.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2.5">
                {repository.maintainers.slice(0, 5).map((maintainer) => (
                  <div
                    key={maintainer.id}
                    className="relative h-8 w-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center hover:z-10 hover:scale-110 transition-transform cursor-pointer"
                    title={maintainer.username}
                  >
                    {maintainer.avatar ? (
                      <img
                        src={maintainer.avatar}
                        alt={maintainer.username}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-white">
                        {maintainer.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {repository.maintainers.length > 5 && (
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-700 border-2 border-slate-900">
                  <span className="text-xs font-semibold text-slate-300">
                    +{repository.maintainers.length - 5}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant={repository.rewardsEnabled ? "outline" : "default"}
          size="sm"
          onClick={() => onManageSettings(repository.id)}
          className={cn(
            "w-full font-medium transition-all",
            repository.rewardsEnabled
              ? "border-green-500 text-green-400 hover:bg-green-500/10 hover:text-green-300 hover:border-green-400"
              : "bg-sky-600 hover:bg-sky-700 text-white"
          )}
        >
          <Settings className="h-4 w-4 mr-2" />
          {repository.rewardsEnabled ? 'Manage Settings' : 'Enable Rewards'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RepositoryCard;
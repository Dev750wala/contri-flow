import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Progress } from './ui/progress';
import { Github, Wallet, CheckCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userType: 'owner' | 'contributor' | null;
}

export function AuthModal({
  isOpen,
  onClose,
  onComplete,
  userType,
}: AuthModalProps) {
  const [step, setStep] = useState<'github' | 'wallet' | 'complete'>('github');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('github');
      setProgress(0);
    }
  }, [isOpen]);

  const handleGitHubAuth = async () => {
    setIsLoading(true);
    setProgress(30);

    // Simulate GitHub OAuth
    setTimeout(() => {
      setProgress(60);
      setTimeout(() => {
        setStep('wallet');
        setProgress(100);
        setIsLoading(false);
      }, 1000);
    }, 1500);
  };

  const handleWalletConnect = async () => {
    setIsLoading(true);
    setProgress(30);

    // Simulate wallet connection
    setTimeout(() => {
      setProgress(60);
      setTimeout(() => {
        setStep('complete');
        setProgress(100);
        setIsLoading(false);

        // Auto-complete after showing success
        setTimeout(() => {
          onComplete();
        }, 1500);
      }, 1000);
    }, 1500);
  };

  const getStepContent = () => {
    switch (step) {
      case 'github':
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Github className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Connect with GitHub</CardTitle>
              <CardDescription>
                {userType === 'owner'
                  ? 'Connect your GitHub account to manage repositories and set up reward pools.'
                  : 'Connect your GitHub account to view your contributions and claim rewards.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleGitHubAuth}
                disabled={isLoading}
                className="w-full flex items-center gap-2"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Github className="h-5 w-5" />
                )}
                Continue with GitHub
              </Button>

              {isLoading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Authenticating...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'wallet':
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                {userType === 'owner'
                  ? 'Connect your wallet to deposit ETH and manage reward distributions.'
                  : 'Connect your wallet to receive ETH rewards for your contributions.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={handleWalletConnect}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Wallet className="h-5 w-5" />
                  )}
                  Connect MetaMask
                </Button>

                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  size="lg"
                  disabled
                >
                  <Wallet className="h-5 w-5" />
                  WalletConnect (Soon)
                </Button>
              </div>

              {isLoading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Connecting wallet...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'complete':
        return (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Welcome to ContriFlow!</CardTitle>
              <CardDescription>
                Your account has been successfully set up.
                {userType === 'owner'
                  ? ' You can now start managing repositories and setting up reward pools.'
                  : ' You can now view your contributions and claim available rewards.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">GitHub account connected</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Wallet connected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {userType === 'owner'
              ? 'Repository Owner Setup'
              : 'Contributor Setup'}
          </DialogTitle>
          <DialogDescription>
            Let's get you set up in just a few steps.
          </DialogDescription>
        </DialogHeader>

        {getStepContent()}
      </DialogContent>
    </Dialog>
  );
}

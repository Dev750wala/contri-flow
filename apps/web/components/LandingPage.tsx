import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Github, Coins, Shield, Zap, Users, GitBranch } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface LandingPageProps {
  onLogin: (userType: 'owner' | 'contributor') => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background to-muted/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Decentralized • Transparent • Secure
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ContriFlow
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A decentralized platform that automatically rewards open-source contributors with ETH 
            based on merged pull requests. Transparent, secure, and built on blockchain.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => onLogin('owner')}
              className="flex items-center gap-2"
            >
              <Github className="h-5 w-5" />
              I'm a Repository Owner
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onLogin('contributor')}
              className="flex items-center gap-2"
            >
              <GitBranch className="h-5 w-5" />
              I'm a Contributor
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Solving Open Source Incentivization</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Open-source projects often lack proper incentivization for contributors, 
              leading to missed opportunities for innovation and collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Lack of Incentives</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Talented developers contribute for free with no financial rewards, 
                  limiting participation and quality contributions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>No Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Existing reward systems lack transparency and verifiable 
                  tracking of contributions and payments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle>Manual Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No automated way to detect valuable contributions and 
                  distribute rewards efficiently.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How ContriFlow Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our decentralized system automates the entire reward process from 
              contribution detection to ETH distribution.
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6 text-center">Initial Setup Flow</h3>
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-8">
                <ImageWithFallback 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=300&fit=crop"
                  alt="Initial Setup Flow Diagram"
                  className="w-full h-auto rounded-lg"
                />
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mb-2 mx-auto">1</div>
                    <p className="text-sm">GitHub Login</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mb-2 mx-auto">2</div>
                    <p className="text-sm">Connect Wallet</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mb-2 mx-auto">3</div>
                    <p className="text-sm">Add Repositories</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold mb-2 mx-auto">4</div>
                    <p className="text-sm">Deposit ETH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Github className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">GitHub Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Seamless integration with GitHub repositories and pull request monitoring.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Auto Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  AI bot automatically detects reward-worthy contributions and generates vouchers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Blockchain Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Smart contracts ensure secure, transparent, and verifiable reward distribution.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">ETH Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Contributors receive ETH rewards with real-time USD to ETH conversion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built with Modern Technology</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ContriFlow leverages cutting-edge blockchain and web technologies 
              for a secure and seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              'Next.js', 'TypeScript', 'Solidity', 'Ethereum', 'Chainlink', 'PostgreSQL'
            ].map((tech) => (
              <Card key={tech} className="text-center">
                <CardContent className="py-6">
                  <Badge variant="outline">{tech}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Open Source?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join ContriFlow and be part of the future of decentralized contribution rewards.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => onLogin('owner')}
              className="flex items-center gap-2"
            >
              Start Rewarding Contributors
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => onLogin('contributor')}
              className="flex items-center gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Start Earning Rewards
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
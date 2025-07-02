import { Button } from '@/components/ui/button';
import { ArrowRight, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import TagButton from '@/components/tag-button';

export default function HeroSection({ session }: { session: any }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-6 py-32 text-center relative z-10"
    >
      <div className="max-w-4xl mx-auto">
        <TagButton />
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-cyan-200 sm:text-7xl drop-shadow-lg">
          Reward Open Source
          <span className="block text-cyan-600">Contributors with Crypto</span>
        </h1>
        <p className="mt-6 text-lg text-cyan-100/80">
          Automate crypto rewards for open source contributions. When PRs are
          merged, contributors can instantly claim their bounties through our
          secure platform.
        </p>
        <div className="mt-10 flex items-center gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
            <Link href={session ? '/dashboard' : '/auth/sign-in'}>
              <Button
                size="lg"
                className="gap-2 bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
            <Link href="https://github.com/your-repo" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-cyan-400 text-cyan-400 hover:bg-cyan-900/30 transition"
              >
                <Github className="h-4 w-4" /> View on GitHub
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

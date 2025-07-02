import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTASection({ session }: { session: any }) {
  return (
    <section className="container mx-auto px-6 py-20 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-black/20 backdrop-blur-sm border border-cyan-400/20"
      >
        <h2 className="text-3xl font-bold text-cyan-200 mb-4">
          Ready to Start Contributing?
        </h2>
        <p className="text-cyan-100/80 mb-8">
          Join our community of contributors and start earning rewards for your
          open source contributions.
        </p>
        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }}>
          <Link href={session ? '/dashboard' : '/auth/sign-in'}>
            <Button
              size="lg"
              className="gap-2 bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

import { motion } from 'framer-motion';

export default function StatsSection() {
  return (
    <section className="container mx-auto px-6 py-20 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 rounded-2xl bg-black/20 backdrop-blur-sm"
        >
          <div className="text-4xl font-bold text-cyan-400 mb-2">$1M+</div>
          <div className="text-cyan-100/60">Total Rewards Distributed</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-6 rounded-2xl bg-black/20 backdrop-blur-sm"
        >
          <div className="text-4xl font-bold text-cyan-400 mb-2">10K+</div>
          <div className="text-cyan-100/60">Active Contributors</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 rounded-2xl bg-black/20 backdrop-blur-sm"
        >
          <div className="text-4xl font-bold text-cyan-400 mb-2">500+</div>
          <div className="text-cyan-100/60">Projects Supported</div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';

export default function FeaturesSection({ features }: { features: any[] }) {
  return (
    <section className="container mx-auto px-6 py-20 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-black/20 backdrop-blur-sm border border-cyan-400/20 hover:border-cyan-400/40 transition-colors"
          >
            <div className="text-cyan-400 mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-cyan-100/60">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

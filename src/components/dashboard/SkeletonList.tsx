import { motion } from 'framer-motion';

interface SkeletonListProps {
  count?: number;
  delay?: number;
  className?: string;
}

export function SkeletonList({ count = 4, delay = 0, className = '' }: SkeletonListProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.3 }}
      className={`space-y-3 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-20 lg:h-24 bg-slate-50 rounded-lg animate-pulse"
        />
      ))}
    </motion.div>
  );
}

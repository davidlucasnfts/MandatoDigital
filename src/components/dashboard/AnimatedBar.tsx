import { motion } from 'framer-motion';

interface AnimatedBarProps {
  progress: number;
  color?: string;
  height?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export function AnimatedBar({
  progress,
  color = 'bg-blue-600',
  height = 'h-2',
  delay = 0,
  duration = 0.8,
  className = '',
}: AnimatedBarProps) {
  return (
    <div className={`w-full ${height} bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

interface AnimatedMiniBarProps {
  progress: number;
  color?: string;
  delay?: number;
  className?: string;
}

export function AnimatedMiniBar({
  progress,
  color = 'bg-blue-500',
  delay = 0,
  className = '',
}: AnimatedMiniBarProps) {
  return (
    <div className={`w-full h-1.5 bg-slate-100 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(progress, 100)}%` }}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

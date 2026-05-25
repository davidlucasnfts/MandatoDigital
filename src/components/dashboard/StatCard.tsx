import { type LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan' | 'pink';
  trend?: {
    value: number;
    positive: boolean;
  };
  invertTrend?: boolean;
  onClick?: () => void;
  delay?: number;
}

const colorMap = {
  blue:  { border: 'border-t-blue-600',  icon: 'text-blue-600',  bg: 'bg-blue-50' },
  green: { border: 'border-t-green-600', icon: 'text-green-600', bg: 'bg-green-50' },
  amber: { border: 'border-t-amber-600', icon: 'text-amber-600', bg: 'bg-amber-50' },
  red:   { border: 'border-t-red-600',   icon: 'text-red-600',   bg: 'bg-red-50' },
  purple:{ border: 'border-t-purple-600',icon: 'text-purple-600',bg: 'bg-purple-50' },
  cyan:  { border: 'border-t-cyan-600',  icon: 'text-cyan-600',  bg: 'bg-cyan-50' },
  pink:  { border: 'border-t-pink-600',  icon: 'text-pink-600',  bg: 'bg-pink-50' },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  invertTrend = false,
  onClick,
  delay = 0,
}: StatCardProps) {
  const colors = colorMap[color];
  const isGood = trend ? (invertTrend ? !trend.positive : trend.positive) : true;
  const TrendIcon = trend?.positive ? TrendingUp : TrendingDown;
  const trendColor = isGood ? 'text-green-600' : 'text-red-600';
  const trendBg = isGood ? 'bg-green-50' : 'bg-red-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="h-full"
    >
      <button
        onClick={onClick}
        className={`w-full h-full text-left rounded-xl border border-slate-200 bg-white border-t-[3px] ${colors.border}
          shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      >
        <div className="p-3 lg:p-4">
          {/* Header: ícone com fundo + seta */}
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
              <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${colors.icon}`} />
            </div>
            <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-300 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Valor */}
          <div className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>

          {/* Footer: label + trend */}
          <div className="flex items-center justify-between mt-1.5 lg:mt-2">
            <span className="text-[10px] lg:text-xs text-slate-500 font-medium leading-tight">
              {label}
            </span>
            {trend && (
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] lg:text-[10px] font-semibold ${trendBg} ${trendColor}`}>
                <TrendIcon className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}

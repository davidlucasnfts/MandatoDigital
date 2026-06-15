import { motion } from 'framer-motion';
import { type ReactNode, isValidElement } from 'react';

interface PanelCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }> | ReactNode;
  iconColor?: string;
  iconBg?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  badge?: number | string;
  badgeColor?: string;
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function PanelCard({
  title,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  action,
  badge,
  badgeColor = 'bg-blue-100 text-blue-700',
  children,
  delay = 0,
  className = '',
}: PanelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className={`h-full ${className}`}
    >
      <div className="h-full rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-3 lg:px-6 pt-3 lg:pt-4 pb-0">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 lg:w-7 lg:h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
              {isValidElement(Icon) ? (
                <span className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex items-center justify-center">{Icon}</span>
              ) : (
                <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${iconColor}`} />
              )}
            </div>
            <h3 className="text-sm lg:text-base font-semibold text-slate-800">
              {title}
            </h3>
            {badge !== undefined && badge !== 0 && (
              <span className={`${badgeColor} text-[10px] lg:text-xs px-1.5 py-0.5 rounded-full font-semibold`}>
                {badge}
              </span>
            )}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className="text-[10px] lg:text-xs font-medium text-blue-600 hover:text-blue-700
                px-2 py-1 rounded-md hover:bg-blue-50 transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-3 lg:px-6 pt-2 lg:pt-3 pb-3 lg:pb-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

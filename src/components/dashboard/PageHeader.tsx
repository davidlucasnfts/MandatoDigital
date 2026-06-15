import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconColor?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  };
  extraActions?: ReactNode;
  delay?: number;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  action,
  extraActions,
  delay = 0,
}: PageHeaderProps) {
  const ActionIcon = action?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {Icon && <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor} flex-shrink-0`} strokeWidth={2} />}
            <span className="truncate">{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {extraActions}
          {action && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white w-fit"
              onClick={action.onClick}
            >
              {ActionIcon && <ActionIcon className="w-4 h-4 mr-1.5" strokeWidth={2} />}
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

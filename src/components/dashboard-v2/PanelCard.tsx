import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PanelCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function PanelCard({
  title,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
  action,
  children,
  delay = 0,
  className = "",
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
        <div className="flex items-center justify-between px-4 lg:px-6 pt-4 lg:pt-5 pb-0">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <h3 className="text-sm lg:text-base font-semibold text-slate-800">
              {title}
            </h3>
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
        <div className="px-4 lg:px-6 pt-3 pb-4 lg:pb-5">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

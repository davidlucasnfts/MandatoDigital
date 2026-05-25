import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 lg:py-8 text-center">
      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-2 lg:mb-3">
        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-slate-300" />
      </div>
      <p className="text-xs lg:text-sm font-medium text-slate-600">{title}</p>
      {description && (
        <p className="text-[10px] lg:text-xs text-slate-400 mt-0.5 lg:mt-1 max-w-[200px]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 lg:mt-3 text-[10px] lg:text-xs font-medium text-blue-600 hover:text-blue-700
            px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

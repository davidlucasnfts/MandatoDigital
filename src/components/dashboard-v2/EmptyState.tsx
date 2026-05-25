import { type LucideIcon } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center py-8 lg:py-10 text-center">
      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-slate-300" />
      </div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

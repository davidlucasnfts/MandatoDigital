import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

export interface DataListAction {
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick: (e: React.MouseEvent) => void;
  variant?: 'blue' | 'red' | 'green' | 'slate' | 'purple';
}

interface DataListItemProps<T> {
  item: T;
  index: number;
  renderIcon: (item: T) => {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    bg: string;
    color: string;
  };
  renderTitle: (item: T) => ReactNode;
  renderBadges?: (item: T) => ReactNode;
  renderMeta?: (item: T) => ReactNode;
  actions?: DataListAction[] | ((item: T) => DataListAction[]);
  onClick?: (item: T) => void;
  isInactive?: (item: T) => boolean;
  delay?: number;
}

function DataListItem<T>({
  item,
  index,
  renderIcon,
  renderTitle,
  renderBadges,
  renderMeta,
  actions,
  onClick,
  isInactive,
  delay = 0,
}: DataListItemProps<T>) {
  const { icon: Icon, bg, color } = renderIcon(item);
  const inactive = isInactive?.(item);
  const itemActions = typeof actions === 'function' ? actions(item) : actions;

  const variantClasses = {
    blue: 'bg-blue-600 text-white hover:bg-blue-700',
    red: 'bg-red-600 text-white hover:bg-red-700',
    green: 'bg-green-600 text-white hover:bg-green-700',
    slate: 'bg-slate-600 text-white hover:bg-slate-700',
    purple: 'bg-purple-600 text-white hover:bg-purple-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (delay + index) * 0.05, duration: 0.4 }}
      className={`p-3 rounded-xl border transition-all cursor-pointer ${
        inactive
          ? 'bg-slate-50 border-slate-100 opacity-75'
          : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
      }`}
      onClick={() => onClick?.(item)}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="break-all line-clamp-2">{renderTitle(item)}</div>
          {renderBadges && (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {renderBadges(item)}
            </div>
          )}
          {renderMeta && <div className="mt-1.5">{renderMeta(item)}</div>}
        </div>
        {itemActions && itemActions.length > 0 && (
          <div className="flex flex-col gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {itemActions.map((action, i) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={i}
                  onClick={action.onClick}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg shadow-sm transition-colors ${
                    variantClasses[action.variant || 'blue']
                  }`}
                >
                  {ActionIcon && <ActionIcon className="w-3.5 h-3.5" strokeWidth={2} />}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface DataListProps<T> extends Omit<DataListItemProps<T>, 'item' | 'index'> {
  items: T[];
  emptyState?: ReactNode;
  className?: string;
}

export function DataList<T>({
  items,
  renderIcon,
  renderTitle,
  renderBadges,
  renderMeta,
  actions,
  onClick,
  isInactive,
  emptyState,
  className = '',
  delay = 0,
}: DataListProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <DataListItem
          key={index}
          item={item}
          index={index}
          renderIcon={renderIcon}
          renderTitle={renderTitle}
          renderBadges={renderBadges}
          renderMeta={renderMeta}
          actions={actions}
          onClick={onClick}
          isInactive={isInactive}
          delay={delay}
        />
      ))}
    </div>
  );
}

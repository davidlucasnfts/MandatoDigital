import { motion } from 'framer-motion';
import { Search } from '@/lib/icons';

interface FilterTab {
  value: string;
  label: string;
  count?: number;
}

interface SearchFilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  tabs?: FilterTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  delay?: number;
  showSearch?: boolean;
}

export function SearchFilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  tabs,
  activeTab,
  onTabChange,
  delay = 0,
  showSearch = true,
}: SearchFilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      {showSearch && (
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      )}
      {tabs && tabs.length > 0 && (
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onTabChange?.(tab.value)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

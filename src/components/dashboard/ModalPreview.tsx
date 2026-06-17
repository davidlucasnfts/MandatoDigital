import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from '@/lib/icons';
import { type ReactNode } from 'react';

interface ModalPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function ModalPreview({ isOpen, onClose, children, maxWidth = 'max-w-lg' }: ModalPreviewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />
          {/* Container */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 lg:pt-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} max-h-[85vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ModalPreviewHeaderProps {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconColor?: string;
  iconBg?: string;
  title: string;
  badges?: ReactNode;
  description?: string;
  onClose: () => void;
  actions?: ReactNode;
}

export function ModalPreviewHeader({
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBg = 'bg-blue-50',
  title,
  badges,
  description,
  onClose,
  actions,
}: ModalPreviewHeaderProps) {
  return (
    <div className="p-4 lg:p-6 border-b border-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon className={`w-6 h-6 lg:w-7 lg:h-7 ${iconColor}`} strokeWidth={2} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-lg lg:text-xl font-bold text-slate-800 break-all line-clamp-2">{title}</h3>
            {badges && <div className="flex items-center gap-2 mt-1.5 flex-wrap">{badges}</div>}
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {actions}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </div>
      {description && (
        <p className="text-sm text-slate-500 mt-3 break-all">{description}</p>
      )}
    </div>
  );
}

interface ModalPreviewFooterProps {
  actions?: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}

export function ModalPreviewFooter({
  actions,
  onClose,
  closeLabel = 'Fechar',
}: ModalPreviewFooterProps) {
  return (
    <div className="p-4 lg:p-6 pt-0 space-y-3">
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      <div className="flex justify-center">
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ChevronDown className="w-4 h-4" strokeWidth={2} /> {closeLabel}
        </button>
      </div>
    </div>
  );
}

interface ModalPreviewGridProps {
  children: ReactNode;
  className?: string;
}

export function ModalPreviewGrid({ children, className = '' }: ModalPreviewGridProps) {
  return (
    <div className={`p-4 lg:p-6 grid grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
}

interface ModalPreviewFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function ModalPreviewField({ label, children, className = '' }: ModalPreviewFieldProps) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1">{label}</p>
      <div className="text-sm font-medium text-slate-800 break-all">{children}</div>
    </div>
  );
}

import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmBtnStyles =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
      : variant === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
      : 'bg-neutral-900 hover:bg-neutral-800 text-white focus:ring-neutral-900';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isLoading ? undefined : onCancel}
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 z-10"
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                variant === 'danger'
                  ? 'bg-rose-100 text-rose-600'
                  : variant === 'warning'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-neutral-100 text-neutral-800'
              }`}
            >
              <AlertTriangle size={20} />
            </div>

            <div className="flex-1">
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">
                {title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {message}
              </p>
            </div>

            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100 border border-neutral-200 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 ${confirmBtnStyles}`}
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

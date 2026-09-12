import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterOption {
  id: string;
  name: string;
  description?: string;
}

interface FilterPopoverProps {
  label: string;
  options: FilterOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  label,
  options,
  selectedIds,
  onToggle,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => selectedIds.includes(o.id));
  const hasActive = Boolean(selectedOption);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className={`relative inline-block text-left ${isOpen ? 'z-50' : 'z-10'}`}
      ref={containerRef}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
          hasActive
            ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
            : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
        }`}
        aria-expanded={isOpen}
      >
        <span>
          {hasActive ? `${label}: ${selectedOption?.name}` : label}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 mt-2 w-60 sm:w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200/90 p-3 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-neutral-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                {label}
              </span>
              {hasActive && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[10px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <X size={11} />
                  <span>RESET</span>
                </button>
              )}
            </div>

            {/* Options List with Single Select Radio */}
            <div className="max-h-60 overflow-y-auto space-y-1 py-1 custom-scrollbar">
              {options.map((opt) => {
                const isSelected = selectedIds.includes(opt.id);

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onToggle(opt.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-100 text-neutral-950 font-medium'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {/* Custom Radio Circle */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs uppercase tracking-wider text-neutral-900 leading-snug truncate">
                        {opt.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

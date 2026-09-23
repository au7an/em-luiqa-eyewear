import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { FilterOption } from './FilterPopover';

interface CatalogFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  frameShapes: FilterOption[];
  faceShapes: FilterOption[];
  occasions: FilterOption[];
  selectedFrameShapes: string[];
  selectedFaceShapes: string[];
  selectedOccasions: string[];
  onToggleFrameShape: (id: string) => void;
  onToggleFaceShape: (id: string) => void;
  onToggleOccasion: (id: string) => void;
  onResetAll: () => void;
  totalMatches: number;
  language: 'id' | 'en';
}

export const CatalogFilterDrawer: React.FC<CatalogFilterDrawerProps> = ({
  isOpen,
  onClose,
  frameShapes,
  faceShapes,
  occasions,
  selectedFrameShapes,
  selectedFaceShapes,
  selectedOccasions,
  onToggleFrameShape,
  onToggleFaceShape,
  onToggleOccasion,
  onResetAll,
  totalMatches,
  language,
}) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeCount =
    selectedFrameShapes.length + selectedFaceShapes.length + selectedOccasions.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-neutral-200"
            role="dialog"
            aria-modal="true"
            aria-label="Filter Options"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-neutral-900">
                  {language === 'id' ? 'FILTER KACAMATA' : 'REFINE SILHOUETTES'}
                </h2>
                {activeCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-900 text-white">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1.5 text-neutral-400 hover:text-black transition-colors rounded-full"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Filter Options Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 divide-y divide-neutral-100">
              {/* 1. Frame Shape */}
              <div>
                <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-neutral-900 mb-3.5 flex items-center justify-between">
                  <span>{language === 'id' ? 'BENTUK FRAME' : 'FRAME SHAPE'}</span>
                  {selectedFrameShapes.length > 0 && (
                    <span className="text-[10px] font-normal text-neutral-400 lowercase tracking-normal">
                      {selectedFrameShapes.length} {language === 'id' ? 'dipilih' : 'selected'}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {frameShapes.map((shape) => {
                    const isSelected = selectedFrameShapes.includes(shape.id);
                    return (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => onToggleFrameShape(shape.id)}
                        className={`px-3 py-1.5 text-xs tracking-wider uppercase transition-all rounded-none border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black'
                        }`}
                      >
                        {isSelected && <Check size={11} className="stroke-[2.5]" />}
                        <span>{shape.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Face Shape */}
              <div className="pt-6">
                <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-neutral-900 mb-3.5 flex items-center justify-between">
                  <span>{language === 'id' ? 'BENTUK WAJAH' : 'FACE SHAPE'}</span>
                  {selectedFaceShapes.length > 0 && (
                    <span className="text-[10px] font-normal text-neutral-400 lowercase tracking-normal">
                      {selectedFaceShapes.length} {language === 'id' ? 'dipilih' : 'selected'}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {faceShapes.map((face) => {
                    const isSelected = selectedFaceShapes.includes(face.id);
                    return (
                      <button
                        key={face.id}
                        type="button"
                        onClick={() => onToggleFaceShape(face.id)}
                        className={`px-3 py-1.5 text-xs tracking-wider uppercase transition-all rounded-none border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black'
                        }`}
                      >
                        {isSelected && <Check size={11} className="stroke-[2.5]" />}
                        <span>{face.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Occasions */}
              <div className="pt-6">
                <h3 className="text-xs font-semibold tracking-[0.16em] uppercase text-neutral-900 mb-3.5 flex items-center justify-between">
                  <span>{language === 'id' ? 'GAYA / ACARA' : 'OCCASION'}</span>
                  {selectedOccasions.length > 0 && (
                    <span className="text-[10px] font-normal text-neutral-400 lowercase tracking-normal">
                      {selectedOccasions.length} {language === 'id' ? 'dipilih' : 'selected'}
                    </span>
                  )}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {occasions.map((occ) => {
                    const isSelected = selectedOccasions.includes(occ.id);
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => onToggleOccasion(occ.id)}
                        className={`px-3 py-1.5 text-xs tracking-wider uppercase transition-all rounded-none border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 font-medium'
                            : 'bg-white text-neutral-700 border-neutral-200 hover:border-black hover:text-black'
                        }`}
                      >
                        {isSelected && <Check size={11} className="stroke-[2.5]" />}
                        <span>{occ.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/50 flex items-center gap-3">
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={onResetAll}
                  className="px-4 py-3 text-xs tracking-widest uppercase font-semibold text-neutral-600 hover:text-black transition-colors underline underline-offset-4"
                >
                  {language === 'id' ? 'HAPUS SEMUA' : 'RESET'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-5 bg-neutral-900 hover:bg-black text-white text-xs tracking-[0.18em] uppercase font-semibold transition-all shadow-xs text-center"
              >
                {language === 'id'
                  ? `TAMPILKAN HASIL (${totalMatches})`
                  : `VIEW RESULTS (${totalMatches})`}
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

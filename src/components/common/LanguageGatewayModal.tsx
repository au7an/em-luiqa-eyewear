import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '../../store/useLanguageStore';

export const LanguageGatewayModal: React.FC = () => {
  const { isGatewayOpen, setLanguage, closeGateway } = useLanguageStore();

  if (!isGatewayOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        {/* 40% Opacity Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-md"
          onClick={closeGateway}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl px-2"
        >
          {/* Header Title: Strictly 1 Line */}
          <h2 className="font-heading font-bold text-[12px] sm:text-base md:text-xl tracking-[0.16em] sm:tracking-[0.22em] uppercase text-white drop-shadow-md text-center mb-4 sm:mb-6 whitespace-nowrap select-none">
            PILIH BAHASA / SELECT LANGUAGE
          </h2>

          {/* 2 Clean Landscape Selection Boxes (No dark border, fill-in from bottom animation) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-lg">
            {/* Box 1: Indonesia */}
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className="group relative overflow-hidden bg-white rounded-xl sm:rounded-2xl shadow-xl h-14 sm:h-20 flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-200 select-none border-0 focus:outline-none"
            >
              {/* Base Black Text */}
              <span className="font-heading font-bold text-sm sm:text-lg md:text-xl tracking-wider uppercase text-neutral-900">
                INDONESIA
              </span>

              {/* Fill-in overlay from bottom */}
              <div
                className="absolute inset-0 bg-black flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none"
                aria-hidden="true"
              >
                <span className="font-heading font-bold text-sm sm:text-lg md:text-xl tracking-wider uppercase text-white">
                  INDONESIA
                </span>
              </div>
            </button>

            {/* Box 2: English */}
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className="group relative overflow-hidden bg-white rounded-xl sm:rounded-2xl shadow-xl h-14 sm:h-20 flex items-center justify-center cursor-pointer active:scale-95 transition-transform duration-200 select-none border-0 focus:outline-none"
            >
              {/* Base Black Text */}
              <span className="font-heading font-bold text-sm sm:text-lg md:text-xl tracking-wider uppercase text-neutral-900">
                ENGLISH
              </span>

              {/* Fill-in overlay from bottom */}
              <div
                className="absolute inset-0 bg-black flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none"
                aria-hidden="true"
              >
                <span className="font-heading font-bold text-sm sm:text-lg md:text-xl tracking-wider uppercase text-white">
                  ENGLISH
                </span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


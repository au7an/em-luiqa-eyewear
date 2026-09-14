import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AnimatedButton } from './AnimatedButton';

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

          {/* 2 Clean Landscape Selection Boxes (Stationary Reveal Fill Animation) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-lg">
            {/* Box 1: Indonesia */}
            <AnimatedButton
              type="button"
              variant="light"
              onClick={() => setLanguage('id')}
              className="rounded-xl sm:rounded-2xl shadow-xl h-14 sm:h-20 font-heading font-bold text-sm sm:text-lg md:text-xl tracking-wider uppercase border-0 focus:outline-none"
            >
              INDONESIA
            </AnimatedButton>

            {/* Box 2: English */}
            <AnimatedButton
              type="button"
              variant="light"
              onClick={() => setLanguage('en')}
              className="rounded-xl sm:rounded-2xl shadow-xl h-14 sm:h-20 font-heading font-bold text-sm sm:text-lg md:text-xl tracking-wider uppercase border-0 focus:outline-none"
            >
              ENGLISH
            </AnimatedButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};


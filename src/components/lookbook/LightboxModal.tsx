import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';

export const LightboxModal: React.FC = () => {
  const { lightboxImage, closeLightbox } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    if (lightboxImage) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxImage, closeLightbox]);

  if (!lightboxImage) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={closeLightbox}
          className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all border border-white/20"
          aria-label="Close Lightbox"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="relative max-w-5xl max-h-[88vh] flex flex-col items-center justify-center"
        >
          <img
            src={lightboxImage.src}
            alt={lightboxImage.title || 'Lookbook Editorial'}
            className="max-h-[78vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
          />

          {(lightboxImage.title || lightboxImage.caption) && (
            <div className="mt-4 text-center">
              {lightboxImage.title && (
                <h4 className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-1">
                  {lightboxImage.title}
                </h4>
              )}
              {lightboxImage.caption && (
                <p className="text-neutral-400 text-xs font-light max-w-md">
                  {lightboxImage.caption}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

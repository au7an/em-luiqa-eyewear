import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampaignStore } from '../../store/useCampaignStore';

const DEFAULT_SLIDE_DURATION = 6000;

export const HeroCarousel: React.FC = () => {
  const { activeCampaigns, loadActiveCampaigns } = useCampaignStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(DEFAULT_SLIDE_DURATION);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    loadActiveCampaigns();
  }, [loadActiveCampaigns]);

  const slides = activeCampaigns.length > 0 ? activeCampaigns : [];

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const currentSlide = slides[currentIndex] || slides[0];

  // Handle slide change & playback duration
  useEffect(() => {
    if (!currentSlide) return;

    if (currentSlide.media_type === 'video') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else {
      setCurrentDuration(currentSlide.autoplay_duration || DEFAULT_SLIDE_DURATION);
    }
  }, [currentIndex, currentSlide]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || !currentSlide) return;
    if (currentSlide.media_type === 'video') return; // Video advances via onEnded

    const timer = setInterval(() => {
      nextSlide();
    }, currentDuration);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, currentDuration, currentSlide, nextSlide]);

  // Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) nextSlide();
      else prevSlide();
    }
  };

  const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const dur = e.currentTarget.duration;
    if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
      setCurrentDuration(dur * 1000);
    }
  };

  if (!currentSlide) return null;

  return (
    <section
      className="relative w-full h-[52vh] sm:h-[58vh] md:h-[62vh] min-h-[420px] max-h-[580px] bg-neutral-900 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Media Carousel with Framer Motion crossfade */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          {currentSlide.media_type === 'video' ? (
            <video
              ref={videoRef}
              src={currentSlide.desktop_media_url}
              preload="auto"
              autoPlay
              muted
              playsInline
              onLoadedMetadata={handleVideoLoadedMetadata}
              onEnded={nextSlide}
              onError={() => {
                setCurrentDuration(DEFAULT_SLIDE_DURATION);
              }}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={currentSlide.desktop_media_url}
              alt={currentSlide.title}
              className="w-full h-full object-cover object-center"
            />
          )}

          {/* Gentle Monster Style subtle contrast gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/25 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Hidden preloader for background videos to eliminate latency */}
      <div className="hidden" aria-hidden="true">
        {slides
          .filter((s, idx) => idx !== currentIndex && s.media_type === 'video')
          .map((s) => (
            <video
              key={s.id}
              src={s.desktop_media_url}
              preload="auto"
              muted
            />
          ))}
      </div>

      {/* Bottom-Center Slide Content */}
      <div className="relative z-20 h-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-end text-center pb-12 sm:pb-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Title */}
            <h1 className="text-lg sm:text-2xl md:text-[25px] font-semibold tracking-[0.14em] uppercase text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)] mb-3 sm:mb-4 leading-tight">
              {currentSlide.title}
            </h1>

            {/* Frosted Glass Outline Pill Buttons */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5">
              <Link
                to={currentSlide.primary_cta_url}
                className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-full border border-white/75 bg-white/10 hover:bg-white/20 text-white text-[12px] sm:text-[13px] font-normal tracking-wide backdrop-blur-xs transition-all duration-200 shadow-sm active:scale-98"
              >
                {currentSlide.primary_cta_label}
              </Link>

              <Link
                to={currentSlide.secondary_cta_url}
                className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-full border border-white/75 bg-white/10 hover:bg-white/20 text-white text-[12px] sm:text-[13px] font-normal tracking-wide backdrop-blur-xs transition-all duration-200 shadow-sm active:scale-98"
              >
                {currentSlide.secondary_cta_label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Centered Thin Slider Line Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3.5 sm:bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2 sm:gap-3">
          {slides.map((s, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={s.id || idx}
                onClick={() => setCurrentIndex(idx)}
                className="py-2 px-0.5 flex items-center focus:outline-none group cursor-pointer"
                aria-label={`Slide ${idx + 1}`}
              >
                <div className="w-14 sm:w-20 md:w-24 h-[1.5px] bg-white/30 rounded-full overflow-hidden relative group-hover:bg-white/50 transition-colors">
                  {isActive && (
                    <motion.div
                      key={`progress-${idx}-${currentDuration}`}
                      initial={{ width: '0%' }}
                      animate={{ width: isPaused ? '0%' : '100%' }}
                      transition={{ duration: currentDuration / 1000, ease: 'linear' }}
                      className="h-full bg-white rounded-full"
                    />
                  )}
                  {idx < currentIndex && (
                    <div className="w-full h-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

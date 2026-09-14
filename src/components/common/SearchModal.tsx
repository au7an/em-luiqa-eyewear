import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useProductStore } from '../../store/useProductStore';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const products = useProductStore((state) => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      setSearchTerm('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // ESC key listener to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, closeSearch]);

  const filteredProducts =
    searchTerm.trim() === ''
      ? []
      : products.filter((p) => {
          if (!p.published) return false;
          const query = searchTerm.toLowerCase();
          return (
            p.name.toLowerCase().includes(query) ||
            p.edition?.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            (p.badge && p.badge.toLowerCase().includes(query)) ||
            (p.material && p.material.toLowerCase().includes(query))
          );
        });

  // Top 4 popular / featured products
  const popularProducts = products
    .filter((p) => p.published)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    .slice(0, 4);

  const handleProductSelect = (productId: string) => {
    closeSearch();
    navigate(`/product/${productId}`);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs z-40"
          />

          {/* Full-Width Top Slide-Down Drawer */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl border-b border-neutral-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-10 sm:pb-12">
              {/* Search Bar Row: Large Gray Input + Clean Minimalist X Close */}
              <div className="flex items-center gap-3 sm:gap-6 mb-8">
                {/* Large Gray Input Bar */}
                <div className="flex-1 flex items-center bg-[#f4f4f5] px-4 sm:px-6 py-3.5 sm:py-4.5 gap-3 sm:gap-4 transition-colors focus-within:bg-[#ebebee]">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-500 shrink-0" strokeWidth={1.8} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="TYPE TO SEARCH"
                    className="w-full bg-transparent font-heading font-medium tracking-[0.14em] uppercase text-sm sm:text-base md:text-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="p-1 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                      aria-label="Clear input"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Big Minimal Close Icon */}
                <button
                  type="button"
                  onClick={closeSearch}
                  className="p-2 text-neutral-800 hover:text-black transition-opacity hover:opacity-75 focus:outline-none cursor-pointer shrink-0"
                  aria-label="Close search"
                >
                  <X className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-800" strokeWidth={1.3} />
                </button>
              </div>

              {/* Main Search Body */}
              {searchTerm.trim() === '' ? (
                <div className="space-y-8">
                  {/* Popular Searches Tags */}
                  <div>
                    <h3 className="font-heading font-bold text-xs tracking-[0.18em] uppercase text-neutral-900 mb-3.5 select-none">
                      POPULAR SEARCHES
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {['SUNGLASSES', 'OPTICAL', 'BESTSELLER', 'CERVULA 01', 'ANAK JUJUR', 'TITANIUM', 'LIMITED EDITION'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSearchTerm(tag)}
                          className="border border-neutral-900 text-neutral-900 px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-heading font-medium tracking-wider uppercase hover:bg-black hover:text-white transition-all cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Items 4-Column Grid */}
                  <div>
                    <h3 className="font-heading font-bold text-xs tracking-[0.18em] uppercase text-neutral-900 mb-4 select-none">
                      POPULAR ITEMS
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      {popularProducts.map((p) => {
                        const img =
                          p.images?.find((i) => i.image_type === 'Primary')?.image_url ||
                          p.images?.[0]?.image_url ||
                          '/assets/images/cervula.jpg';

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleProductSelect(p.id)}
                            className="group cursor-pointer flex flex-col"
                          >
                            <div className="aspect-[4/3] bg-neutral-100/70 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-2.5 transition-transform duration-300 group-hover:scale-[1.02]">
                              <img
                                src={img}
                                alt={p.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                              />
                            </div>
                            <div className="font-heading font-bold text-xs sm:text-sm uppercase tracking-wide text-neutral-900 group-hover:text-black truncate">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-light truncate">
                              {p.edition || (p.category === 'sunglasses' ? 'Sunglasses' : 'Optical')}
                            </div>
                            <div className="text-xs font-semibold text-neutral-900 mt-1">
                              {p.price}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Live Filtered Results */
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                    <span className="font-heading font-bold text-xs tracking-[0.18em] uppercase text-neutral-900">
                      RESULTS ({filteredProducts.length})
                    </span>
                    <span className="text-xs text-neutral-400 font-light">
                      Press ESC or click outside to close
                    </span>
                  </div>

                  {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                      {filteredProducts.map((p) => {
                        const img =
                          p.images?.find((i) => i.image_type === 'Primary')?.image_url ||
                          p.images?.[0]?.image_url ||
                          '/assets/images/cervula.jpg';

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleProductSelect(p.id)}
                            className="group cursor-pointer flex flex-col"
                          >
                            <div className="aspect-[4/3] bg-neutral-100/70 rounded-xl p-3 flex items-center justify-center overflow-hidden mb-2.5 transition-transform duration-300 group-hover:scale-[1.02]">
                              <img
                                src={img}
                                alt={p.name}
                                className="w-full h-full object-contain mix-blend-multiply"
                              />
                            </div>
                            <div className="font-heading font-bold text-xs sm:text-sm uppercase tracking-wide text-neutral-900 group-hover:text-black truncate">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-light truncate">
                              {p.edition || (p.category === 'sunglasses' ? 'Sunglasses' : 'Optical')}
                            </div>
                            <div className="text-xs font-semibold text-neutral-900 mt-1">
                              {p.price}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="font-heading font-semibold text-sm uppercase tracking-wider text-neutral-800 mb-1">
                        NO FRAMES FOUND FOR "{searchTerm.toUpperCase()}"
                      </p>
                      <p className="text-xs text-neutral-400 font-light">
                        Try searching for "optical", "sunglasses", or specific frame models.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useProductStore } from '../../store/useProductStore';
import { Badge } from './Badge';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, openQuickview } = useUIStore();
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

  const handleProductSelect = (productId: string) => {
    closeSearch();
    navigate(`/product/${productId}`);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-modal overflow-hidden border border-neutral-100 z-10"
          >
            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center gap-3">
              <Search size={22} className="text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search eyewear frames, editions, specs..."
                className="w-full bg-transparent text-base sm:text-lg text-neutral-900 placeholder-neutral-400 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-neutral-400 hover:text-black"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={closeSearch}
                className="text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-black px-2 py-1"
              >
                ESC
              </button>
            </div>

            {/* Live Search Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
              {searchTerm.trim() === '' ? (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                    Popular Collections
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['Sunglasses', 'Optical', 'Cervula 01', 'Anak Jujur', 'Amber Shades', 'Titanium'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchTerm(tag)}
                        className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-xs font-medium text-neutral-700 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                    Featured Highlights
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {products.slice(0, 2).map((p) => {
                      const img =
                        p.images?.find((i) => i.image_type === 'Primary')?.image_url ||
                        p.images?.[0]?.image_url ||
                        '/assets/images/cervula.jpg';

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleProductSelect(p.id)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors border border-neutral-100"
                        >
                          <img
                            src={img}
                            alt={p.name}
                            className="w-14 h-14 object-contain rounded-lg bg-neutral-100 p-1"
                          />
                          <div>
                            <div className="text-xs font-bold text-neutral-900">{p.name}</div>
                            <div className="text-[11px] text-neutral-500">{p.price}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider font-semibold text-neutral-400 mb-2">
                    Found {filteredProducts.length} Results
                  </div>
                  {filteredProducts.map((product) => {
                    const img =
                      product.images?.find((i) => i.image_type === 'Primary')?.image_url ||
                      product.images?.[0]?.image_url ||
                      '/assets/images/cervula.jpg';

                    return (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 border border-neutral-100/60 transition-all group"
                      >
                        <div
                          onClick={() => handleProductSelect(product.id)}
                          className="flex items-center gap-4 cursor-pointer flex-1"
                        >
                          <img
                            src={img}
                            alt={product.name}
                            className="w-16 h-16 object-contain rounded-lg bg-neutral-100 p-1 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-bold text-neutral-900 group-hover:text-black">
                                {product.name}
                              </span>
                              {product.badge && (
                                <Badge variant="outline" className="text-[9px] py-0">
                                  {product.badge}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 font-light mb-1">
                              {product.edition || '2026 Collection'}
                            </div>
                            <div className="text-xs font-semibold text-neutral-900">
                              {product.price}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              closeSearch();
                              openQuickview(product);
                            }}
                            className="text-xs text-neutral-500 hover:text-black px-2.5 py-1.5 rounded-full border border-neutral-200 hover:border-black transition-colors"
                          >
                            Quick View
                          </button>
                          <button
                            onClick={() => handleProductSelect(product.id)}
                            className="p-2 text-neutral-400 group-hover:text-black transition-colors"
                            aria-label="View Product"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-500 text-sm mb-2">
                    No frames found for "{searchTerm}"
                  </p>
                  <p className="text-xs text-neutral-400">
                    Try searching for "optical", "sunglasses", or specific frame names.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

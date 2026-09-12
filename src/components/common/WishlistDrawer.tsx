import React from 'react';
import { X, Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useProductStore } from '../../store/useProductStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Link } from 'react-router-dom';

export const WishlistDrawer: React.FC = () => {
  const { wishlistProductIds, isOpen, closeWishlist, toggleWishlist, clearWishlist } = useWishlistStore();
  const products = useProductStore((state) => state.products);
  const settings = useSettingsStore((state) => state.settings);

  const wishlistProducts = products.filter((p) => wishlistProductIds.includes(p.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlist}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart size={20} className="text-rose-500 fill-rose-500" />
                  <h3 className="editorial-title text-xl text-neutral-900 uppercase">
                    Wishlist ({wishlistProducts.length})
                  </h3>
                </div>
                <button
                  onClick={closeWishlist}
                  className="p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors"
                  aria-label="Close Wishlist"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-neutral-100">
                {wishlistProducts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                      <Heart size={28} />
                    </div>
                    <h4 className="text-base font-bold text-neutral-800 mb-1">
                      Your wishlist is empty
                    </h4>
                    <p className="text-xs text-neutral-500 max-w-xs mb-6">
                      Save your favorite silhouettes to review anytime.
                    </p>
                    <Link
                      to="/catalog"
                      onClick={closeWishlist}
                      className="px-6 py-2.5 rounded-full bg-neutral-900 text-white text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors"
                    >
                      Explore Frames
                    </Link>
                  </div>
                ) : (
                  wishlistProducts.map((product) => {
                    const primaryImg =
                      product.images?.find((img) => img.image_type === 'Primary')?.image_url ||
                      product.images?.[0]?.image_url ||
                      '/assets/images/cervula.jpg';

                    const shopeeUrl = product.shopee_url || settings.shopee_url || 'https://shopee.co.id';

                    return (
                      <div key={product.id} className="py-4 flex gap-4 items-center">
                        <img
                          src={primaryImg}
                          alt={product.name}
                          className="w-20 h-20 object-contain rounded-xl bg-neutral-100 border border-neutral-100 p-1 shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link
                                to={`/product/${product.id}`}
                                onClick={closeWishlist}
                                className="text-sm font-bold text-neutral-900 hover:underline truncate block"
                              >
                                {product.name}
                              </Link>
                              <p className="text-[11px] text-neutral-500 font-light truncate">
                                {product.edition || '2026 Collection'}
                              </p>
                              <div className="text-xs font-bold text-neutral-900 mt-1">
                                {product.price}
                              </div>
                            </div>
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className="text-neutral-400 hover:text-rose-500 p-1 transition-colors"
                              aria-label="Remove from wishlist"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <a
                              href={shopeeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 bg-neutral-900 text-white text-[11px] uppercase tracking-wider font-semibold py-1.5 px-3 rounded-full flex items-center justify-center gap-1.5 hover:bg-neutral-800 transition-colors"
                            >
                              <ShoppingBag size={13} />
                              <span>Buy on Shopee</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {wishlistProducts.length > 0 && (
                <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
                  <button
                    onClick={clearWishlist}
                    className="text-xs text-neutral-500 hover:text-rose-500 underline"
                  >
                    Clear All
                  </button>

                  <Link
                    to="/catalog"
                    onClick={closeWishlist}
                    className="text-xs uppercase tracking-wider font-bold text-neutral-900 hover:underline flex items-center gap-1"
                  >
                    <span>Browse More</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Badge } from './Badge';
import { StatusBadge } from '../admin/StatusBadge';
import { ColorSwatchPicker } from '../catalog/ColorSwatchPicker';
import { ProductVariant } from '../../types/database';
import { Link } from 'react-router-dom';

export const QuickviewModal: React.FC = () => {
  const { quickviewProduct, closeQuickview } = useUIStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { getProductWALink, settings } = useSettingsStore();

  const [activeVariant, setActiveVariant] = useState<ProductVariant | undefined>();

  useEffect(() => {
    if (quickviewProduct) {
      const initial =
        quickviewProduct.variants?.find((v) => v.is_default && v.is_active) ||
        quickviewProduct.variants?.find((v) => v.is_active) ||
        quickviewProduct.variants?.[0];
      setActiveVariant(initial);
    }
  }, [quickviewProduct]);

  if (!quickviewProduct) return null;

  const inWishlist = isInWishlist(quickviewProduct.id);

  // Derive images from active variant or fallback
  const variantImages =
    activeVariant?.images && activeVariant.images.length > 0
      ? activeVariant.images
      : quickviewProduct.images || [];

  const primaryImg =
    variantImages.find((i) => i.image_type === 'Primary')?.image_url ||
    variantImages[0]?.image_url ||
    quickviewProduct.images?.[0]?.image_url ||
    '/assets/images/cervula.jpg';

  const currentPrice = activeVariant?.price || quickviewProduct.price;
  const currentCompareAt = activeVariant?.compare_at_price || quickviewProduct.compare_at_price;
  const currentStock = activeVariant?.stock_status || quickviewProduct.stock_status;
  const shopeeUrl =
    activeVariant?.shopee_url ||
    quickviewProduct.shopee_url ||
    settings.shopee_url ||
    'https://shopee.co.id';
  const whatsappUrl = getProductWALink(
    quickviewProduct.name,
    activeVariant?.color_name || quickviewProduct.color
  );

  const detailUrl = activeVariant
    ? `/product/${quickviewProduct.id}?variant=${activeVariant.id}`
    : `/product/${quickviewProduct.id}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeQuickview}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-modal overflow-hidden border border-neutral-100 z-10 my-auto"
        >
          {/* Close Button */}
          <button
            onClick={closeQuickview}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black hover:scale-105 transition-all shadow-sm"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Showcase */}
            <div className="relative bg-[#f8f8fa] min-h-[320px] md:min-h-[460px] flex items-center justify-center p-8 overflow-hidden group">
              <img
                key={primaryImg}
                src={primaryImg}
                alt={`${quickviewProduct.name} - ${activeVariant?.color_name || 'View'}`}
                className="w-full h-full max-h-[380px] object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500 ease-out"
              />

              {quickviewProduct.badge && (
                <div className="absolute top-5 left-5">
                  <Badge variant="glass" className="font-semibold">
                    {quickviewProduct.badge}
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Details & Purchase Actions */}
            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-semibold">
                    {quickviewProduct.frame_shape_obj?.name || quickviewProduct.frame_shape || quickviewProduct.edition || '2026 Collection'}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                    {quickviewProduct.category}
                  </span>
                </div>

                <h2 className="editorial-title text-2xl sm:text-3xl text-neutral-900 mb-2">
                  {quickviewProduct.name}
                </h2>

                <div className="flex items-baseline gap-2.5 mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                    {currentPrice}
                  </span>
                  {currentCompareAt && (
                    <span className="text-xs text-neutral-400 line-through">
                      {currentCompareAt}
                    </span>
                  )}
                  <span className="ml-auto">
                    <StatusBadge status={currentStock} size="sm" />
                  </span>
                </div>

                {/* Color Swatch Picker */}
                {quickviewProduct.variants && quickviewProduct.variants.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <ColorSwatchPicker
                      variants={quickviewProduct.variants}
                      activeVariantId={activeVariant?.id || ''}
                      onSelectVariant={(v) => setActiveVariant(v)}
                      size="sm"
                      showLabel
                    />
                  </div>
                )}

                <p className="text-sm text-neutral-600 font-light leading-relaxed mb-6">
                  {quickviewProduct.short_description || quickviewProduct.description}
                </p>

                {/* Specs Box */}
                <div className="bg-neutral-50 rounded-2xl p-4 mb-6 border border-neutral-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
                    Technical Specifications
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">
                        Material
                      </span>
                      <span className="text-neutral-800 font-medium">
                        {quickviewProduct.material || 'Acetate'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase">
                        Active Colorway
                      </span>
                      <span className="text-neutral-800 font-medium">
                        {activeVariant?.color_name || quickviewProduct.color || 'Standard'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <a
                    href={shopeeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex-1 py-3.5 px-6 rounded-full font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-98 ${
                      currentStock === 'Sold Out'
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed pointer-events-none'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    <ShoppingBag size={16} />
                    <span>{currentStock === 'Sold Out' ? 'Sold Out' : 'Buy on Shopee'}</span>
                  </a>

                  <button
                    onClick={() => toggleWishlist(quickviewProduct.id)}
                    className={`p-3.5 rounded-full border transition-colors flex items-center justify-center ${
                      inWishlist
                        ? 'border-rose-200 bg-rose-50 text-rose-500'
                        : 'border-neutral-200 hover:border-black text-neutral-700'
                    }`}
                    aria-label="Wishlist"
                  >
                    <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs uppercase tracking-wider font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Layers size={14} />
                    <span>Customize Lens via WA</span>
                  </a>

                  <Link
                    to={detailUrl}
                    onClick={closeQuickview}
                    className="text-xs uppercase tracking-wider font-semibold text-neutral-500 hover:text-black transition-colors"
                  >
                    View Full Specs →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

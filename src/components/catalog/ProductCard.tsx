import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductVariant } from '../../types/database';
import { ColorSwatchPicker } from './ColorSwatchPicker';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Determine initial variant: default flag or first active
  const initialVariant =
    product.variants?.find((v) => v.is_default && v.is_active !== false) ||
    product.variants?.find((v) => v.is_active !== false) ||
    product.variants?.[0];

  const [activeVariant, setActiveVariant] = useState<ProductVariant | undefined>(initialVariant);

  useEffect(() => {
    const updatedInitial =
      product.variants?.find((v) => v.is_default && v.is_active !== false) ||
      product.variants?.find((v) => v.is_active !== false) ||
      product.variants?.[0];
    setActiveVariant(updatedInitial);
  }, [product.variants]);

  // Derive imagery based on active variant
  const variantImages =
    activeVariant?.images && activeVariant.images.length > 0
      ? activeVariant.images
      : product.images || [];

  const primaryImage =
    variantImages.find((img) => img.image_type === 'Primary')?.image_url ||
    variantImages[0]?.image_url ||
    product.images?.[0]?.image_url ||
    '/assets/images/cervula.jpg';

  const hoverImage =
    variantImages.find((img) => img.image_type === 'Lifestyle' || img.image_type === 'Campaign')
      ?.image_url ||
    product.images?.find((img) => img.image_type === 'Lifestyle')?.image_url;

  // Derive pricing and commerce data
  const currentPrice = activeVariant?.price || product.price;
  const currentCompareAt = activeVariant?.compare_at_price || product.compare_at_price;
  const currentStock = activeVariant?.stock_status || product.stock_status;

  const productLink = activeVariant
    ? `/product/${product.id}?variant=${activeVariant.id}`
    : `/product/${product.id}`;

  return (
    <Link
      to={productLink}
      className="group relative flex flex-col bg-white overflow-hidden border-r border-b border-neutral-200/80 transition-colors duration-300"
    >
      {/* Product Image Stage (3:4 Editorial Portrait Aspect Ratio) - Full White Seamless Stage */}
      <div className="relative aspect-[3/4] bg-white overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-7 select-none">
        {/* Still Image */}
        <img
          src={primaryImage}
          alt={`${product.name} - ${activeVariant?.color_name || 'View'}`}
          className={`w-full h-full object-contain transition-all duration-700 ease-out group-hover:scale-[1.02] ${
            hoverImage ? 'group-hover:opacity-0' : ''
          }`}
          loading="lazy"
        />

        {/* Model/Campaign Hover Image */}
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} model wearing`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out scale-100 group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}

        {/* Minimal Understated Badge / Stock Status */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {product.badge && (
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              {product.badge}
            </span>
          )}
          {currentStock === 'Sold Out' && (
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-rose-600 bg-rose-50/80 px-1.5 py-0.5 border border-rose-100">
              Sold Out
            </span>
          )}
          {currentStock === 'Low Stock' && (
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-700 bg-amber-50/80 px-1.5 py-0.5 border border-amber-100">
              Low Stock
            </span>
          )}
        </div>
      </div>

      {/* Minimalist Editorial Info Section */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Product Name */}
          <h3 className="text-xs sm:text-[13px] font-medium text-neutral-900 group-hover:text-neutral-500 transition-colors tracking-wide leading-snug line-clamp-2 mb-1.5">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-xs text-neutral-600 font-normal">
              {currentPrice}
            </span>
            {currentCompareAt && (
              <span className="text-[10px] text-neutral-400 line-through">
                {currentCompareAt}
              </span>
            )}
          </div>
        </div>

        {/* Minimal Micro-Swatches */}
        {product.variants && product.variants.length > 1 && (
          <div
            className="pt-1 mt-auto"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <ColorSwatchPicker
              variants={product.variants}
              activeVariantId={activeVariant?.id || ''}
              onSelectVariant={(v) => setActiveVariant(v)}
              size="sm"
            />
          </div>
        )}
      </div>
    </Link>
  );
};

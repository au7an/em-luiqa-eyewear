import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductVariant } from '../../types/database';
import { Badge } from '../common/Badge';
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
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 hover:border-neutral-300 hover:shadow-liquid transition-all duration-300"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] bg-[#f8f8fa] overflow-hidden flex items-center justify-center p-4 sm:p-5">
        {/* Still Image */}
        <img
          src={primaryImage}
          alt={`${product.name} - ${activeVariant?.color_name || 'View'}`}
          className={`w-full h-full object-contain transition-all duration-500 ease-out group-hover:scale-105 ${
            hoverImage ? 'group-hover:opacity-0' : ''
          }`}
          loading="lazy"
        />

        {/* Model Hover Image (if available) */}
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} model wearing`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out scale-100 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Stock / Highlight Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {product.badge && (
            <Badge variant="glass" className="font-semibold shadow-2xs text-[9px] px-2 py-0.5">
              {product.badge}
            </Badge>
          )}
          {currentStock === 'Sold Out' && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-2xs">
              Sold Out
            </span>
          )}
          {currentStock === 'Low Stock' && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
              Low Stock
            </span>
          )}
        </div>
      </div>

      {/* Minimalist Info Section: Name, Price, and Color Swatches */}
      <div className="p-3 sm:p-3.5 flex flex-col justify-between flex-1 bg-white">
        <div>
          {/* Product Name */}
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-black tracking-tight truncate mb-1">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-xs sm:text-sm font-bold text-neutral-900">
              {currentPrice}
            </span>
            {currentCompareAt && (
              <span className="text-[10px] sm:text-[11px] text-neutral-400 line-through">
                {currentCompareAt}
              </span>
            )}
          </div>
        </div>

        {/* Color Swatch Picker */}
        {product.variants && product.variants.length > 0 && (
          <div
            className="pt-1"
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

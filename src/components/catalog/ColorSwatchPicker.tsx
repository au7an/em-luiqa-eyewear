import React from 'react';
import { ProductVariant } from '../../types/database';

interface ColorSwatchPickerProps {
  variants: ProductVariant[];
  activeVariantId: string;
  onSelectVariant: (variant: ProductVariant) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  hideIfSingle?: boolean;
  className?: string;
}

export const ColorSwatchPicker: React.FC<ColorSwatchPickerProps> = ({
  variants,
  activeVariantId,
  onSelectVariant,
  size = 'sm',
  showLabel = false,
  hideIfSingle = false,
  className = '',
}) => {
  const activeVariants = variants.filter((v) => v.is_active !== false);
  if (activeVariants.length === 0) return null;
  if (hideIfSingle && activeVariants.length <= 1) return null;

  const currentActive = activeVariants.find((v) => v.id === activeVariantId) || activeVariants[0];

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const ringOffsetClasses = {
    sm: 'ring-offset-1',
    md: 'ring-offset-2',
    lg: 'ring-offset-2',
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {showLabel && currentActive && (
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400 uppercase tracking-wider font-semibold text-[10px]">
            Colorway:
          </span>
          <span className="text-neutral-900 font-medium truncate max-w-[180px]">
            {currentActive.color_name}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {activeVariants.map((v) => {
          const isSelected = v.id === currentActive?.id;
          const isSoldOut = v.stock_status === 'Sold Out';

          return (
            <button
              key={v.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectVariant(v);
              }}
              title={`${v.color_name}${isSoldOut ? ' (Sold Out)' : ''}`}
              aria-label={`Select color: ${v.color_name}`}
              className={`relative rounded-full transition-all flex items-center justify-center cursor-pointer ${
                sizeClasses[size]
              } ${
                isSelected
                  ? `ring-2 ring-neutral-900 ${ringOffsetClasses[size]} scale-110 shadow-xs`
                  : 'hover:scale-110 hover:ring-1 hover:ring-neutral-400 ring-1 ring-neutral-200'
              } ${isSoldOut ? 'opacity-60' : ''}`}
              style={{
                backgroundColor: v.color_hex || '#000000',
                backgroundImage: v.swatch_image_url ? `url(${v.swatch_image_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Subtle strikethrough for Sold Out */}
              {isSoldOut && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-full h-[1.5px] bg-rose-500 rotate-45 transform" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

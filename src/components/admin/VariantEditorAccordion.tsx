import React, { useState } from 'react';
import {
  ChevronDown,
  Plus,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
} from 'lucide-react';
import { ProductVariant, StockStatus } from '../../types/database';
import { FormField, Input, Select } from './FormField';
import { CurrencyInput } from './CurrencyInput';
import { MediaUploader } from './MediaUploader';
import { generateUUID } from '../../lib/uuid';

interface VariantEditorAccordionProps {
  productId: string;
  basePrice: string;
  baseCompareAtPrice?: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

export const VariantEditorAccordion: React.FC<VariantEditorAccordionProps> = ({
  productId,
  basePrice,
  baseCompareAtPrice,
  variants,
  onChange,
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>(
    variants.length > 0 ? [variants[0].id] : []
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddVariant = () => {
    const newIndex = variants.length + 1;
    const newId = generateUUID();
    const nowIso = new Date().toISOString();
    const newVariant: ProductVariant = {
      id: newId,
      product_id: productId || 'new',
      color_name: `Colorway ${newIndex}`,
      color_hex: '#111111',
      sku: '',
      stock_status: 'Available',
      is_active: true,
      is_default: variants.length === 0,
      sort_order: newIndex,
      images: [],
      created_at: nowIso,
      updated_at: nowIso,
    };

    const updated = [...variants, newVariant];
    onChange(updated);
    setExpandedIds([...expandedIds, newId]);
  };

  const handleUpdateVariant = (id: string, updates: Partial<ProductVariant>) => {
    const updated = variants.map((v) => (v.id === id ? { ...v, ...updates } : v));
    onChange(updated);
  };

  const handleDeleteVariant = (id: string) => {
    if (variants.length <= 1) {
      alert('A product must retain at least one color variant.');
      return;
    }
    const filtered = variants.filter((v) => v.id !== id);
    // If deleted was default, make first remaining default
    if (filtered.length > 0 && !filtered.some((v) => v.is_default)) {
      filtered[0].is_default = true;
    }
    onChange(filtered);
    setExpandedIds(expandedIds.filter((x) => x !== id));
  };

  const handleSetDefault = (id: string) => {
    const updated = variants.map((v) => ({
      ...v,
      is_default: v.id === id,
    }));
    onChange(updated);
  };

  const handleMoveVariant = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === variants.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...variants];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // re-assign sort_orders
    copy.forEach((v, idx) => {
      v.sort_order = idx + 1;
    });
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            Color Variants & Gallery Management
          </h3>
          <p className="text-[11px] text-neutral-400">
            Configure colorways, specific SKUs, price overrides, and individual image galleries.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddVariant}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Plus size={14} />
          <span>Add Variant</span>
        </button>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-10 bg-neutral-50 rounded-xl border border-dashed border-neutral-300 p-6">
          <p className="text-xs text-neutral-500 mb-3">No color variants created yet.</p>
          <button
            type="button"
            onClick={handleAddVariant}
            className="px-4 py-2 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-800 hover:bg-neutral-100"
          >
            Create First Variant
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => {
            const isExpanded = expandedIds.includes(variant.id);
            const imageCount = variant.images?.length || 0;

            return (
              <div
                key={variant.id}
                className={`rounded-xl border transition-all ${
                  isExpanded
                    ? 'border-neutral-300 bg-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/70 hover:bg-neutral-50'
                }`}
              >
                {/* Accordion Header */}
                <div
                  className="p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(variant.id)}
                >
                  {/* Reorder Arrows */}
                  <div
                    className="flex flex-col gap-0.5 text-neutral-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveVariant(index, 'up')}
                      className="hover:text-black disabled:opacity-20 p-0.5"
                      title="Move up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === variants.length - 1}
                      onClick={() => handleMoveVariant(index, 'down')}
                      className="hover:text-black disabled:opacity-20 p-0.5"
                      title="Move down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  {/* Swatch Color Indicator */}
                  <div
                    className="w-6 h-6 rounded-full border border-neutral-300 shadow-2xs shrink-0 flex items-center justify-center"
                    style={{
                      backgroundColor: variant.color_hex || '#000000',
                      backgroundImage: variant.swatch_image_url
                        ? `url(${variant.swatch_image_url})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />

                  {/* Color Title & SKU */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-neutral-900 truncate">
                        {variant.color_name || 'Unnamed Variant'}
                      </span>
                      {variant.is_default && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-neutral-900 text-white">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                      <span>{variant.sku || 'No SKU'}</span>
                      <span>•</span>
                      <span>{variant.price || basePrice || 'Uses base price'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <ImageIcon size={10} />
                        {imageCount} {imageCount === 1 ? 'image' : 'images'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Controls in Header */}
                  <div
                    className="flex items-center gap-2 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Default star button */}
                    <button
                      type="button"
                      onClick={() => handleSetDefault(variant.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        variant.is_default
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-neutral-300 hover:text-neutral-500'
                      }`}
                      title={variant.is_default ? 'Primary default variant' : 'Set as default variant'}
                    >
                      <Star size={15} fill={variant.is_default ? 'currentColor' : 'none'} />
                    </button>

                    {/* Active toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateVariant(variant.id, { is_active: !variant.is_active })
                      }
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        variant.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                      }`}
                      title="Toggle active status on storefront"
                    >
                      {variant.is_active ? 'Active' : 'Hidden'}
                    </button>

                    {/* Delete button */}
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove color variant"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isExpanded ? 'rotate-180 text-black' : ''
                    }`}
                  />
                </div>

                {/* Accordion Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 border-t border-neutral-100 space-y-5 bg-white rounded-b-xl">
                    {/* Grid 1: Basic variant attributes */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField label="Color Name" required>
                        <Input
                          required
                          value={variant.color_name}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, { color_name: e.target.value })
                          }
                          placeholder="e.g. Classic Tortoiseshell"
                        />
                      </FormField>

                      <FormField label="Color Swatch Hex" required helperText="Pick or type hex (e.g. #8B4513)">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={variant.color_hex && variant.color_hex.startsWith('#') && variant.color_hex.length === 7 ? variant.color_hex : '#000000'}
                            onChange={(e) =>
                              handleUpdateVariant(variant.id, { color_hex: e.target.value })
                            }
                            className="w-9 h-9 p-0.5 rounded-lg border border-neutral-200 cursor-pointer shrink-0 bg-white"
                          />
                          <Input
                            required
                            value={variant.color_hex}
                            onChange={(e) =>
                              handleUpdateVariant(variant.id, { color_hex: e.target.value })
                            }
                            placeholder="#111111"
                            className="flex-1 uppercase font-mono text-xs"
                          />
                        </div>
                      </FormField>

                      <FormField label="Swatch Pattern Image URL" helperText="Optional pattern texture for acetate">
                        <Input
                          value={variant.swatch_image_url || ''}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, { swatch_image_url: e.target.value })
                          }
                          placeholder="https://... or /assets/..."
                        />
                      </FormField>
                    </div>

                    {/* Grid 2: Commerce & SKU */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField label="Variant SKU / Code">
                        <Input
                          value={variant.sku || ''}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, { sku: e.target.value })
                          }
                          placeholder="e.g. JL-OPT-001-TOR"
                        />
                      </FormField>

                      <FormField
                        label="Price Override"
                        helperText={`Leave blank to inherit base price (${basePrice || 'IDR 299,000'})`}
                      >
                        <CurrencyInput
                          value={variant.price || ''}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, { price: e.target.value || undefined })
                          }
                          placeholder={basePrice || 'IDR 299,000'}
                        />
                      </FormField>

                      <FormField
                        label="Compare-at Override"
                        helperText="Optional retail strike-through"
                      >
                        <CurrencyInput
                          value={variant.compare_at_price || ''}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, {
                              compare_at_price: e.target.value || undefined,
                            })
                          }
                          placeholder={baseCompareAtPrice || 'Optional'}
                        />
                      </FormField>
                    </div>

                    {/* Grid 3: Stock Status & Shopee link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField label="Variant Stock Status">
                        <Select
                          value={variant.stock_status}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, {
                              stock_status: e.target.value as StockStatus,
                            })
                          }
                        >
                          <option value="Available">Available (In Stock)</option>
                          <option value="Low Stock">Low Stock</option>
                          <option value="Sold Out">Sold Out</option>
                          <option value="Coming Soon">Coming Soon</option>
                        </Select>
                      </FormField>

                      <FormField
                        label="Variant Shopee URL"
                        helperText="Direct checkout URL for this specific colorway"
                      >
                        <Input
                          type="url"
                          value={variant.shopee_url || ''}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, { shopee_url: e.target.value })
                          }
                          placeholder="https://shopee.co.id/product/..."
                        />
                      </FormField>
                    </div>

                    {/* Variant Image Gallery */}
                    <div className="pt-3 border-t border-neutral-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                            {variant.color_name || 'Variant'} Image Gallery ({imageCount})
                          </h4>
                          <p className="text-[11px] text-neutral-400">
                            Upload high-res frames, model wearing shots, and close-up angles for this colorway.
                          </p>
                        </div>
                      </div>

                      <MediaUploader
                        bucket="products"
                        images={variant.images || []}
                        onChange={(imgs) =>
                          handleUpdateVariant(variant.id, {
                            images: imgs.map((img) => ({ ...img, variant_id: variant.id })),
                          })
                        }
                        maxFiles={6}
                        allowTypeSelection
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Add Variant Action Button */}
          <button
            type="button"
            onClick={handleAddVariant}
            className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-white hover:bg-neutral-50/80 text-neutral-700 hover:text-neutral-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
              <Plus size={13} />
            </div>
            <span>Tambah Varian Warna Baru</span>
          </button>
        </div>
      )}
    </div>
  );
};

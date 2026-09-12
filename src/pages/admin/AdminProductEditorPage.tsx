import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Loader2, Trash2, Eye, Plus, X } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FormField, Input, Textarea, Select, Switch } from '../../components/admin/FormField';
import { CurrencyInput } from '../../components/admin/CurrencyInput';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useToast } from '../../components/admin/Toast';
import { useProductStore } from '../../store/useProductStore';
import { useDiscoveryStore } from '../../store/useDiscoveryStore';
import { VariantEditorAccordion } from '../../components/admin/VariantEditorAccordion';
import { TaxonomyQuickAddModal } from '../../components/admin/TaxonomyQuickAddModal';
import { Product, ProductCategory, StockStatus, ProductImage, ProductVariant } from '../../types/database';
import { generateUUID } from '../../lib/uuid';

export const AdminProductEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    loadInitialData,
  } = useProductStore();

  const {
    frameShapes,
    faceShapes,
    occasions,
    loadTaxonomy,
  } = useDiscoveryStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'frame_shape' | 'face_shape' | 'occasion' | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    category: ProductCategory;
    edition: string;
    badge: string;
    price: string;
    compare_at_price: string;
    short_description: string;
    description: string;
    material: string;
    frame_shape: string;
    frame_shape_id: string;
    color: string;
    lens_width: string;
    bridge_width: string;
    temple_length: string;
    overall_width: string;
    lens_height: string;
    weight: string;
    lens_compatible: boolean;
    stock_status: StockStatus;
    featured: boolean;
    published: boolean;
    sort_order: number;
    shopee_url: string;
  }>({
    id: '',
    name: '',
    slug: '',
    sku: '',
    category: 'optical',
    edition: '2026 Studio Collection',
    badge: '',
    price: 'IDR 299,000',
    compare_at_price: '',
    short_description: '',
    description: '',
    material: 'Hand-polished Italian Acetate',
    frame_shape: 'Round',
    frame_shape_id: 'shape-round',
    color: 'Classic Monochrome',
    lens_width: '49 mm',
    bridge_width: '20 mm',
    temple_length: '145 mm',
    overall_width: '140 mm',
    lens_height: '42 mm',
    weight: '28 g',
    lens_compatible: true,
    stock_status: 'Available',
    featured: false,
    published: true,
    sort_order: 1,
    shopee_url: '',
  });

  // Discovery Relations State
  const [selectedFaceShapeIds, setSelectedFaceShapeIds] = useState<string[]>([]);
  const [selectedOccasionIds, setSelectedOccasionIds] = useState<string[]>([]);

  // Variants State
  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: generateUUID(),
      product_id: 'new',
      color_name: 'Classic Monochrome',
      color_hex: '#111111',
      sku: '',
      stock_status: 'Available',
      is_active: true,
      is_default: true,
      sort_order: 1,
      images: [],
    },
  ]);

  useEffect(() => {
    loadInitialData();
    loadTaxonomy();
  }, [loadInitialData, loadTaxonomy]);

  useEffect(() => {
    if (!isNew && id) {
      const existing = products.find((p) => p.id === id);
      if (existing) {
        setFormData({
          id: existing.id,
          name: existing.name,
          slug: existing.slug || existing.id,
          sku: existing.sku || '',
          category: existing.category,
          edition: existing.edition || '',
          badge: existing.badge || '',
          price: existing.price,
          compare_at_price: existing.compare_at_price || '',
          short_description: existing.short_description || '',
          description: existing.description || '',
          material: existing.material || '',
          frame_shape: existing.frame_shape || '',
          frame_shape_id: existing.frame_shape_id || (frameShapes.length > 0 ? frameShapes[0].id : ''),
          color: existing.color || '',
          lens_width: existing.lens_width || '',
          bridge_width: existing.bridge_width || '',
          temple_length: existing.temple_length || '',
          overall_width: existing.overall_width || '',
          lens_height: existing.lens_height || '',
          weight: existing.weight || '',
          lens_compatible: existing.lens_compatible ?? true,
          stock_status: existing.stock_status || 'Available',
          featured: existing.featured ?? false,
          published: existing.published ?? true,
          sort_order: existing.sort_order || 1,
          shopee_url: existing.shopee_url || '',
        });

        // Populate discovery tags
        setSelectedFaceShapeIds(existing.suitable_face_shapes?.map((f) => f.id) || []);
        setSelectedOccasionIds(existing.occasions?.map((o) => o.id) || []);

        // Populate variants (or synthesize from existing images if product had none)
        if (existing.variants && existing.variants.length > 0) {
          setVariants(existing.variants);
        } else {
          setVariants([
            {
              id: generateUUID(),
              product_id: existing.id,
              color_name: existing.color || 'Standard',
              color_hex: '#111111',
              sku: existing.sku || '',
              stock_status: existing.stock_status || 'Available',
              shopee_url: existing.shopee_url || '',
              is_active: true,
              is_default: true,
              sort_order: 1,
              images: existing.images || [],
            },
          ]);
        }
      }
    }
  }, [isNew, id, products, frameShapes]);

  // Auto slug generation on name change for new products
  const handleNameChange = (newName: string) => {
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: isNew ? newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : prev.slug,
    }));
  };

  const toggleFaceShape = (faceId: string) => {
    setSelectedFaceShapeIds((prev) =>
      prev.includes(faceId) ? prev.filter((id) => id !== faceId) : [...prev, faceId]
    );
  };

  const toggleOccasion = (occId: string) => {
    setSelectedOccasionIds((prev) =>
      prev.includes(occId) ? prev.filter((id) => id !== occId) : [...prev, occId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Product name and price are required.',
      });
      return;
    }

    if (variants.length === 0) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'At least one color variant must be configured.',
      });
      return;
    }

    setIsSaving(true);

    const selectedShapeObj = frameShapes.find((s) => s.id === formData.frame_shape_id);

    // Extract default variant's images as fallback primary images
    const defaultVariant = variants.find((v) => v.is_default) || variants[0];
    const baseImages: ProductImage[] = defaultVariant?.images || [];

    const payload: Omit<Product, 'created_at' | 'updated_at'> = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      frame_shape: selectedShapeObj?.name || formData.frame_shape,
      color: defaultVariant.color_name,
    };

    if (isNew) {
      const res = await createProduct(
        payload,
        baseImages,
        variants,
        selectedFaceShapeIds,
        selectedOccasionIds
      );
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Product Created',
          message: `"${formData.name}" and ${variants.length} color variants added.`,
        });
        navigate('/admin/products');
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to create product.',
        });
      }
    } else {
      const res = await updateProduct(
        id,
        payload,
        baseImages,
        variants,
        selectedFaceShapeIds,
        selectedOccasionIds
      );
      setIsSaving(false);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Product Updated',
          message: `"${formData.name}" changes and color variants saved.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: res.error || 'Failed to update product.',
        });
      }
    }
  };

  const handleDelete = async () => {
    if (isNew || !id) return;
    setIsDeleting(true);
    const res = await deleteProduct(id);
    setIsDeleting(false);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Product Deleted',
        message: `Product removed from inventory.`,
      });
      navigate('/admin/products');
    } else {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: res.error || 'Failed to delete product.',
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <PageHeader
        title={isNew ? 'New Eyewear Model' : `Edit: ${formData.name}`}
        description={
          isNew
            ? 'Define basic specs, frame shape, face harmony, occasions, and color variants.'
            : `ID: ${formData.id} • SKU: ${formData.sku || 'N/A'} • ${variants.length} Variants`
        }
        showBackButton
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Products', path: '/admin/products' },
          { label: isNew ? 'New' : formData.name || 'Edit' },
        ]}
      >
        {!isNew && (
          <>
            <a
              href={`/product/${formData.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Eye size={14} />
              <span>Preview</span>
            </a>

            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-neutral-200 transition-colors"
              title="Delete product"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </PageHeader>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Basic Information */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                1. Eyewear Model Identification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Eyewear Model Name" required>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. CERVULA 01"
                  />
                </FormField>

                <FormField label="Slug (URL identifier)" required>
                  <Input
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="e.g. cervula-01"
                  />
                </FormField>

                <FormField label="Master Model SKU / Code">
                  <Input
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="e.g. JL-OPT-001"
                  />
                </FormField>

                <FormField label="Category" required>
                  <Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as ProductCategory,
                      })
                    }
                  >
                    <option value="optical">Optical Frame</option>
                    <option value="sunglasses">Sunglasses</option>
                  </Select>
                </FormField>

                <FormField label="Collection / Edition">
                  <Input
                    value={formData.edition}
                    onChange={(e) =>
                      setFormData({ ...formData, edition: e.target.value })
                    }
                    placeholder="e.g. 2026 Studio Collection"
                  />
                </FormField>

                <FormField label="Badge Highlight">
                  <Input
                    value={formData.badge}
                    onChange={(e) =>
                      setFormData({ ...formData, badge: e.target.value })
                    }
                    placeholder="e.g. Iconic Classic, Bestseller, New"
                  />
                </FormField>
              </div>
            </div>

            {/* 2. Base Pricing */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                2. Base Model Pricing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Base Selling Price" required helperText="Inherited by variants unless overridden">
                  <CurrencyInput
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="IDR 299,000"
                  />
                </FormField>

                <FormField label="Compare-at / Strike-through Price" helperText="Original MSRP retail comparison">
                  <CurrencyInput
                    value={formData.compare_at_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        compare_at_price: e.target.value,
                      })
                    }
                    placeholder="e.g. IDR 399,000"
                  />
                </FormField>
              </div>
            </div>

            {/* 3. Description & Copy */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                3. Editorial Synopsis
              </h3>

              <FormField label="Short Summary" helperText="Shown in cards & quick view">
                <Input
                  value={formData.short_description}
                  onChange={(e) =>
                    setFormData({ ...formData, short_description: e.target.value })
                  }
                  placeholder="Concise 1-sentence synopsis"
                />
              </FormField>

              <FormField label="Full Editorial Description">
                <Textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Craftsmanship notes, architectural silhouette inspiration, fit characteristics..."
                />
              </FormField>
            </div>

            {/* 4. Frame & Discovery Metadata */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <h3 className="text-sm font-semibold text-neutral-900">
                  4. Discovery Attributes & Physical Dimensions
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Select silhouette taxonomy, facial shape harmony, and curated occasions.
                </p>
              </div>

              {/* Discovery Selectors */}
              <div className="space-y-4">
                {/* Frame Shape (Single Select) */}
                <FormField
                  label="Frame Shape (Single Select)"
                  helperText="Primary architectural geometric classification"
                >
                  <div className="flex gap-2">
                    <Select
                      value={formData.frame_shape_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          frame_shape_id: e.target.value,
                          frame_shape:
                            frameShapes.find((s) => s.id === e.target.value)?.name ||
                            formData.frame_shape,
                        })
                      }
                      className="flex-1"
                    >
                      {frameShapes.map((shape) => (
                        <option key={shape.id} value={shape.id}>
                          {shape.name}
                        </option>
                      ))}
                    </Select>
                    <button
                      type="button"
                      onClick={() => setQuickAddType('frame_shape')}
                      className="px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 flex items-center gap-1 shrink-0"
                    >
                      <Plus size={13} />
                      <span>New Shape</span>
                    </button>
                  </div>
                </FormField>

                {/* Suitable Face Shapes (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700">
                      Suitable Face Shapes (Multi-select)
                    </label>
                    <button
                      type="button"
                      onClick={() => setQuickAddType('face_shape')}
                      className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Add Face Shape</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 min-h-[46px]">
                    {faceShapes.map((face) => {
                      const isSelected = selectedFaceShapeIds.includes(face.id);
                      return (
                        <button
                          key={face.id}
                          type="button"
                          onClick={() => toggleFaceShape(face.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-neutral-900 text-white shadow-2xs'
                              : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          <span>{face.name}</span>
                          {isSelected && <X size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Curated Occasions (Multi-select) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-700">
                      Curated Occasions (Multi-select)
                    </label>
                    <button
                      type="button"
                      onClick={() => setQuickAddType('occasion')}
                      className="text-xs font-semibold text-neutral-600 hover:text-black flex items-center gap-1"
                    >
                      <Plus size={12} />
                      <span>Add Occasion</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 min-h-[46px]">
                    {occasions.map((occ) => {
                      const isSelected = selectedOccasionIds.includes(occ.id);
                      return (
                        <button
                          key={occ.id}
                          type="button"
                          onClick={() => toggleOccasion(occ.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-neutral-900 text-white shadow-2xs'
                              : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400'
                          }`}
                        >
                          <span>{occ.name}</span>
                          {isSelected && <X size={11} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Physical Caliber Dimensions */}
              <div className="pt-4 border-t border-neutral-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  Physical Dimensions & Composition
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <FormField label="Material Composition">
                    <Input
                      value={formData.material}
                      onChange={(e) =>
                        setFormData({ ...formData, material: e.target.value })
                      }
                      placeholder="e.g. Hand-polished Italian Cellulose Acetate"
                    />
                  </FormField>

                  <FormField label="Total Frame Weight">
                    <Input
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      placeholder="e.g. 28 g"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormField label="Lens Width">
                    <Input
                      value={formData.lens_width}
                      onChange={(e) =>
                        setFormData({ ...formData, lens_width: e.target.value })
                      }
                      placeholder="48 mm"
                    />
                  </FormField>

                  <FormField label="Bridge Width">
                    <Input
                      value={formData.bridge_width}
                      onChange={(e) =>
                        setFormData({ ...formData, bridge_width: e.target.value })
                      }
                      placeholder="22 mm"
                    />
                  </FormField>

                  <FormField label="Temple Length">
                    <Input
                      value={formData.temple_length}
                      onChange={(e) =>
                        setFormData({ ...formData, temple_length: e.target.value })
                      }
                      placeholder="145 mm"
                    />
                  </FormField>

                  <FormField label="Frame Width">
                    <Input
                      value={formData.overall_width}
                      onChange={(e) =>
                        setFormData({ ...formData, overall_width: e.target.value })
                      }
                      placeholder="138 mm"
                    />
                  </FormField>
                </div>

                <div className="pt-4">
                  <Switch
                    label="Custom Lens Compatible"
                    description="Supports single vision, bifocal, and progressive prescription lenses"
                    checked={formData.lens_compatible}
                    onChange={(checked) =>
                      setFormData({ ...formData, lens_compatible: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* 5. Color Variants & Variant Image Galleries */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs">
              <VariantEditorAccordion
                productId={formData.id}
                basePrice={formData.price}
                baseCompareAtPrice={formData.compare_at_price}
                variants={variants}
                onChange={setVariants}
              />
            </div>
          </div>

          {/* Right Sidebar Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Commerce & Inventory */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                Default Commerce & Stock
              </h3>

              <FormField label="Default Shopee Link" helperText="Fallback checkout URL for ready-to-wear">
                <Input
                  type="url"
                  value={formData.shopee_url}
                  onChange={(e) =>
                    setFormData({ ...formData, shopee_url: e.target.value })
                  }
                  placeholder="https://shopee.co.id/product/..."
                />
              </FormField>

              <FormField label="Default Stock Status">
                <Select
                  value={formData.stock_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
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
            </div>

            {/* Website Visibility */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
                Storefront Visibility
              </h3>

              <Switch
                label="Published"
                description="Visible and discoverable in the storefront catalog"
                checked={formData.published}
                onChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />

              <Switch
                label="Featured Silhouette"
                description="Showcase on the homepage signature pieces grid"
                checked={formData.featured}
                onChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />

              <FormField label="Catalog Sort Order" helperText="Lower numbers appear first">
                <Input
                  type="number"
                  min="1"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </FormField>
            </div>

            {/* Save Button Sticky Card */}
            <div className="bg-neutral-900 text-white rounded-xl p-5 shadow-md space-y-3 sticky top-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Product Status
                </h4>
                <p className="text-sm font-bold text-white mt-0.5">
                  {isNew ? 'Ready to Create' : `Editing: ${variants.length} Variants`}
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Save Eyewear Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </form>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Delete Eyewear Product"
        message={`Are you sure you want to permanently delete "${formData.name}" and all its color variants?`}
        confirmText="Delete Product"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      {/* Taxonomy Quick Add Modal */}
      {quickAddType && (
        <TaxonomyQuickAddModal
          isOpen={!!quickAddType}
          type={quickAddType}
          onClose={() => setQuickAddType(null)}
          onSuccess={(newId) => {
            if (quickAddType === 'frame_shape') {
              setFormData((prev) => ({ ...prev, frame_shape_id: newId }));
            } else if (quickAddType === 'face_shape') {
              setSelectedFaceShapeIds((prev) => [...prev, newId]);
            } else if (quickAddType === 'occasion') {
              setSelectedOccasionIds((prev) => [...prev, newId]);
            }
          }}
        />
      )}
    </div>
  );
};

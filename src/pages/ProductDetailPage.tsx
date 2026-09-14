import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  ArrowUpRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { Badge } from '../components/common/Badge';
import { StatusBadge } from '../components/admin/StatusBadge';
import { ProductCard } from '../components/catalog/ProductCard';
import { ColorSwatchPicker } from '../components/catalog/ColorSwatchPicker';
import { LensCustomizationDrawer } from '../components/product/LensCustomizationDrawer';
import { ProductVariant } from '../types/database';
import { useLanguageStore } from '../store/useLanguageStore';
import { AnimatedButton } from '../components/common/AnimatedButton';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, loadInitialData } = useProductStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { settings } = useSettingsStore();
  const { t, language } = useLanguageStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLensDrawerOpen, setIsLensDrawerOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const product = products.find((p) => p.id === id || p.slug === id);

  // Variant resolution
  const variantParam = searchParams.get('variant') || searchParams.get('color');
  const initialVariant =
    (product?.variants && variantParam
      ? product.variants.find(
          (v) => v.id === variantParam || v.color_name.toLowerCase() === variantParam.toLowerCase()
        )
      : null) ||
    product?.variants?.find((v) => v.is_default && v.is_active !== false) ||
    product?.variants?.find((v) => v.is_active !== false) ||
    product?.variants?.[0];

  const [activeVariant, setActiveVariant] = useState<ProductVariant | undefined>(initialVariant);

  // Sync state when product or search param changes
  useEffect(() => {
    if (!product) return;
    const vMatch =
      (product.variants && variantParam
        ? product.variants.find(
            (v) => v.id === variantParam || v.color_name.toLowerCase() === variantParam.toLowerCase()
          )
        : null) ||
      product.variants?.find((v) => v.is_default && v.is_active !== false) ||
      product.variants?.find((v) => v.is_active !== false) ||
      product.variants?.[0];

    setActiveVariant(vMatch);
  }, [product, variantParam]);

  const handleSelectVariant = (variant: ProductVariant) => {
    setActiveVariant(variant);
    setActiveImageIndex(0); // Reset gallery to first image of the selected variant
    setSearchParams({ variant: variant.id }, { replace: true });
  };

  if (!product) {
    return (
      <div className="pt-36 pb-24 px-4 text-center max-w-lg mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="editorial-title text-3xl mb-4">
          {language === 'id' ? 'Siluet Tidak Ditemukan' : 'Frame Not Found'}
        </h2>
        <p className="text-sm text-neutral-500 mb-6">
          {language === 'id'
            ? 'Siluet kacamata yang dicari tidak ditemukan atau telah diarsipkan.'
            : 'The requested eyewear silhouette could not be found or has been archived.'}
        </p>
        <Link
          to="/catalog"
          className="px-6 py-3 bg-neutral-900 text-white rounded-full text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition-colors"
        >
          {language === 'id' ? 'Kembali ke Katalog' : 'Return to Catalog'}
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category && p.published)
    .slice(0, 3);

  // Images from active variant or fallback to base product images
  const variantImages =
    activeVariant?.images && activeVariant.images.length > 0
      ? activeVariant.images
      : product.images && product.images.length > 0
      ? product.images
      : [
          {
            image_url: '/assets/images/cervula.jpg',
            image_type: 'Primary' as const,
            sort_order: 1,
            alt_text: product.name,
          },
        ];

  const currentImage = variantImages[activeImageIndex] || variantImages[0];

  // Dynamic pricing, stock, SKU, and links based on active variant
  const currentPrice = activeVariant?.price || product.price;
  const currentCompareAt = activeVariant?.compare_at_price || product.compare_at_price;
  const currentStock = activeVariant?.stock_status || product.stock_status;
  const currentSku = activeVariant?.sku || product.sku;
  const shopeeUrl =
    activeVariant?.shopee_url || product.shopee_url || settings.shopee_url || 'https://shopee.co.id';

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} /> {t('pdp.back', 'Back')}
        </button>
        <span>/</span>
        <Link to="/" className="hover:text-black">{language === 'id' ? 'Beranda' : 'Home'}</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-black">{t('navbar.catalog', 'Catalog')}</Link>
        <span>/</span>
        <span className="text-neutral-900 font-bold">{product.name}</span>
      </div>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24">
        {/* Left: Interactive Media Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-[#f8f8fa] rounded-3xl overflow-hidden flex items-center justify-center p-8 border border-neutral-100 shadow-xs">
            <img
              key={currentImage.image_url}
              src={currentImage.image_url}
              alt={currentImage.alt_text || `${product.name} - ${activeVariant?.color_name}`}
              className={`w-full h-full ${
                currentImage.image_type === 'Lifestyle' || currentImage.image_type === 'Campaign'
                  ? 'object-cover'
                  : 'object-contain'
              } drop-shadow-md transition-all duration-500`}
            />

            {product.badge && (
              <div className="absolute top-5 left-5">
                <Badge variant="glass" className="font-semibold">
                  {product.badge}
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails Strip */}
          {variantImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {variantImages.map((img, idx) => (
                <button
                  key={`${img.image_url}-${idx}`}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#f8f8fa] p-1.5 overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-neutral-900 shadow-sm scale-102'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.alt_text || `Angle ${idx + 1}`}
                    className={`w-full h-full ${
                      img.image_type === 'Lifestyle' || img.image_type === 'Campaign'
                        ? 'object-cover rounded-xl'
                        : 'object-contain'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Specifications Matrix */}
          <div className="bg-[#f8f8fa] rounded-3xl p-6 sm:p-7 border border-neutral-100 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 mb-4">
              {t('pdp.specs_title', 'Frame & Discovery Specifications')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-neutral-400 uppercase text-[10px] block font-semibold mb-0.5">
                  {t('pdp.shape', 'Silhouette Shape')}
                </span>
                <span className="text-neutral-800 font-medium">
                  {product.frame_shape_obj?.name || product.frame_shape || 'Round Studio'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 uppercase text-[10px] block font-semibold mb-0.5">
                  {t('pdp.sku', 'SKU Code')}
                </span>
                <span className="text-neutral-800 font-medium">
                  {currentSku || 'JL-OPT-STD'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 uppercase text-[10px] block font-semibold mb-0.5">
                  {t('pdp.material', 'Material')}
                </span>
                <span className="text-neutral-800 font-medium">
                  {product.material || 'Italian Cellulose Acetate'}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 uppercase text-[10px] block font-semibold mb-0.5">
                  {t('pdp.caliber', 'Caliber / Dimensions')}
                </span>
                <span className="text-neutral-800 font-medium">
                  {[product.lens_width, product.bridge_width, product.temple_length]
                    .filter(Boolean)
                    .join(' - ') || t('pdp.universal_fit', 'Universal Fit')}
                </span>
              </div>

              {/* Suitable Face Shapes */}
              {product.suitable_face_shapes && product.suitable_face_shapes.length > 0 && (
                <div className="col-span-2 sm:col-span-4 pt-3 border-t border-neutral-200/50">
                  <span className="text-neutral-400 uppercase text-[10px] block font-semibold mb-1.5">
                    {t('pdp.face_shapes', 'Harmonious Face Shapes')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.suitable_face_shapes.map((fs) => (
                      <span
                        key={fs.id}
                        className="px-2.5 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-800 text-[11px] font-medium"
                      >
                        {fs.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Occasions */}
              {product.occasions && product.occasions.length > 0 && (
                <div className="col-span-2 sm:col-span-4 pt-3 border-t border-neutral-200/50">
                  <span className="text-neutral-400 uppercase text-[10px] block font-semibold mb-1.5">
                    {t('pdp.occasions', 'Curated Occasions')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.occasions.map((occ) => (
                      <span
                        key={occ.id}
                        className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-[11px] font-medium"
                      >
                        {occ.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Specifications & Purchase Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-neutral-400 font-bold mb-2">
              <span>{product.edition || t('pdp.edition', '2026 Studio Collection')}</span>
              <span className="text-neutral-900">{product.category}</span>
            </div>

            <h1 className="editorial-title text-3xl sm:text-4xl lg:text-5xl text-neutral-900 uppercase mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Price & Stock status */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                {currentPrice}
              </span>
              {currentCompareAt && (
                <span className="text-sm text-neutral-400 line-through">
                  {currentCompareAt}
                </span>
              )}
              <span className="ml-auto">
                <StatusBadge status={currentStock} size="md" />
              </span>
            </div>

            {/* Color Swatches Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-neutral-50/80 border border-neutral-200/70">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {t('pdp.selected_colorway', 'Selected Colorway')}
                  </span>
                  <span className="text-xs font-semibold text-neutral-900">
                    {activeVariant?.color_name || 'Standard'}
                  </span>
                </div>
                <ColorSwatchPicker
                  variants={product.variants}
                  activeVariantId={activeVariant?.id || ''}
                  onSelectVariant={handleSelectVariant}
                  size="md"
                />
              </div>
            )}

            <p className="text-sm text-neutral-600 font-light leading-relaxed mb-6">
              {product.description || product.short_description}
            </p>

            {/* Dual Purchase Paths: Frame Only vs Frame + Lens */}
            <div className="space-y-4 mb-8">
              {/* Option 1: FRAME ONLY */}
              <div className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 hover:border-neutral-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 block">
                      {t('pdp.option1_title', 'Path 1: Ready to Wear')}
                    </span>
                    <h3 className="text-sm font-bold text-neutral-900 uppercase mt-0.5">
                      {t('pdp.option1_name', 'Frame Only')}
                    </h3>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">
                    {currentPrice}
                  </span>
                </div>

                <div className="flex gap-2.5">
                  {currentStock === 'Sold Out' ? (
                    <div className="flex-1 py-3.5 px-6 rounded-full font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 bg-neutral-200 text-neutral-500 cursor-not-allowed select-none">
                      <ShoppingBag size={16} />
                      <span>{t('pdp.out_of_stock_shopee', 'Out of Stock on Shopee')}</span>
                    </div>
                  ) : (
                    <AnimatedButton
                      href={shopeeUrl}
                      target="_blank"
                      rel="noreferrer"
                      variant="none"
                      className="flex-1 py-3.5 px-6 rounded-full font-semibold text-xs tracking-wider uppercase bg-[#EE4D2D] text-white shadow-sm border border-[#EE4D2D]"
                      overlayClassName="bg-neutral-950"
                      overlayTextClassName="text-white font-semibold"
                    >
                      <ShoppingBag size={16} />
                      <span>{t('pdp.buy_shopee', 'Buy on Shopee')}</span>
                    </AnimatedButton>
                  )}

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-3.5 rounded-full border transition-colors flex items-center justify-center ${
                      inWishlist
                        ? 'border-rose-200 bg-rose-50 text-rose-500'
                        : 'border-neutral-200 hover:border-black text-neutral-700 bg-white'
                    }`}
                    aria-label="Save to Wishlist"
                  >
                    <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Option 2: FRAME + LENS */}
              <div className="p-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 hover:border-neutral-300 transition-all space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800">
                      <Sparkles size={12} className="text-emerald-700" />
                      <span>{t('pdp.option2_title', 'Path 2: Custom Optical Lens')}</span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 uppercase mt-0.5">
                      {t('pdp.option2_name', 'Frame + Custom Lens')}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {t('pdp.option2_badge', 'Atelier Custom')}
                  </span>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  {t('pdp.option2_desc')}
                </p>

                <AnimatedButton
                  type="button"
                  variant="dark"
                  onClick={() => setIsLensDrawerOpen(true)}
                  className="w-full py-3.5 px-6 rounded-full font-semibold text-xs tracking-wider uppercase shadow-sm"
                >
                  <Layers size={16} />
                  <span>{t('pdp.customize_lens', 'Customize with Lens')}</span>
                  <ArrowUpRight size={15} />
                </AnimatedButton>
              </div>
            </div>

            {/* Assurance Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-neutral-100 text-center text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck size={18} className="text-neutral-700" />
                <span>{t('pdp.authentic_acetate', 'Authentic Acetate')}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Truck size={18} className="text-neutral-700" />
                <span>{t('pdp.insured_shipping', 'Insured Shipping')}</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw size={18} className="text-neutral-700" />
                <span>{t('pdp.fit_guarantee', '7-Day Fit Guarantee')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Silhouettes */}
      {related.length > 0 && (
        <section className="border-t border-neutral-100 pt-16">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 block mb-1">
              {t('pdp.similar_subtitle', 'Curated Complements')}
            </span>
            <h2 className="editorial-title text-2xl sm:text-3xl uppercase">
              {t('pdp.similar_title', 'Similar Silhouettes')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Guided Lens Customization Slide-Over Drawer */}
      <LensCustomizationDrawer
        isOpen={isLensDrawerOpen}
        onClose={() => setIsLensDrawerOpen(false)}
        product={product}
        variant={activeVariant}
      />
    </div>
  );
};

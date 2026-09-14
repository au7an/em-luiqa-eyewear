import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { ProductCard } from '../components/catalog/ProductCard';
import { FilterPopover } from '../components/catalog/FilterPopover';
import { ProductCategory } from '../types/database';
import { useLanguageStore } from '../store/useLanguageStore';
import { AnimatedButton } from '../components/common/AnimatedButton';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    selectedFrameShapes,
    selectedFaceShapes,
    selectedOccasions,
    toggleFrameShape,
    toggleFaceShape,
    toggleOccasion,
    resetDiscoveryFilters,
    loadInitialData,
  } = useProductStore();

  const { frameShapes, faceShapes, occasions, loadTaxonomy } = useDiscoveryStore();
  const { t, language } = useLanguageStore();

  useEffect(() => {
    loadInitialData();
    loadTaxonomy();
  }, [loadInitialData, loadTaxonomy]);

  // Sync category param from URL
  useEffect(() => {
    const categoryParam = searchParams.get('category') as ProductCategory | null;
    if (categoryParam === 'sunglasses' || categoryParam === 'optical') {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('all');
    }
  }, [searchParams, setSelectedCategory]);

  const handleCategoryChange = (cat: 'all' | 'sunglasses' | 'optical') => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  // Active filter tags for chip display
  const activeChips = useMemo(() => {
    const chips: { id: string; label: string; group: 'shape' | 'face' | 'occ'; onRemove: () => void }[] = [];

    selectedFrameShapes.forEach((id) => {
      const item = frameShapes.find((s) => s.id === id);
      if (item) {
        chips.push({ id, label: item.name, group: 'shape', onRemove: () => toggleFrameShape(id) });
      }
    });

    selectedFaceShapes.forEach((id) => {
      const item = faceShapes.find((f) => f.id === id);
      if (item) {
        chips.push({ id, label: item.name, group: 'face', onRemove: () => toggleFaceShape(id) });
      }
    });

    selectedOccasions.forEach((id) => {
      const item = occasions.find((o) => o.id === id);
      if (item) {
        chips.push({ id, label: item.name, group: 'occ', onRemove: () => toggleOccasion(id) });
      }
    });

    return chips;
  }, [selectedFrameShapes, selectedFaceShapes, selectedOccasions, frameShapes, faceShapes, occasions, toggleFrameShape, toggleFaceShape, toggleOccasion]);

  const hasAnyFilterActive =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedFrameShapes.length > 0 ||
    selectedFaceShapes.length > 0 ||
    selectedOccasions.length > 0;

  // Filter & Sort Logic: Standard E-Commerce (OR within groups, AND across groups)
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.published);

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // 2. Frame Shape Filter (OR within group)
    if (selectedFrameShapes.length > 0) {
      list = list.filter((p) => {
        if (p.frame_shape_id && selectedFrameShapes.includes(p.frame_shape_id)) return true;
        // Fallback matching by name/slug if legacy string
        if (p.frame_shape) {
          const match = frameShapes.some(
            (s) => selectedFrameShapes.includes(s.id) && s.name.toLowerCase() === p.frame_shape?.toLowerCase()
          );
          if (match) return true;
        }
        return false;
      });
    }

    // 3. Suitable Face Shape Filter (OR within group)
    if (selectedFaceShapes.length > 0) {
      list = list.filter((p) => {
        return p.suitable_face_shapes?.some((fs) => selectedFaceShapes.includes(fs.id));
      });
    }

    // 4. Occasions Filter (OR within group)
    if (selectedOccasions.length > 0) {
      list = list.filter((p) => {
        return p.occasions?.some((occ) => selectedOccasions.includes(occ.id));
      });
    }

    // 5. Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q) || p.short_description?.toLowerCase().includes(q);
        const matchEdition = p.edition?.toLowerCase().includes(q);
        const matchBadge = p.badge?.toLowerCase().includes(q);
        const matchMaterial = p.material?.toLowerCase().includes(q);
        const matchShape = p.frame_shape?.toLowerCase().includes(q);
        const matchVariants = p.variants?.some((v) => v.color_name.toLowerCase().includes(q) || v.sku?.toLowerCase().includes(q));

        return matchName || matchDesc || matchEdition || matchBadge || matchMaterial || matchShape || matchVariants;
      });
    }

    // 6. Sorting Logic (9 Options)
    const parsePrice = (priceStr?: string) => {
      if (!priceStr) return 0;
      const num = Number(priceStr.replace(/[^0-9]/g, ''));
      return isNaN(num) ? 0 : num;
    };

    switch (sortBy) {
      case 'title-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'title-desc':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        list = [...list].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case 'date-asc':
        list = [...list].sort(
          (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
        break;
      case 'date-desc':
        list = [...list].sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case 'best-selling':
        list = [...list].sort((a, b) => {
          const aIsBest = a.badge?.toLowerCase().includes('bestseller') ? 1 : 0;
          const bIsBest = b.badge?.toLowerCase().includes('bestseller') ? 1 : 0;
          if (aIsBest !== bIsBest) return bIsBest - aIsBest;
          return (a.sort_order ?? 99) - (b.sort_order ?? 99);
        });
        break;
      case 'relevant':
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          list = [...list].sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(q) ? 2 : a.name.toLowerCase().includes(q) ? 1 : 0;
            const bStarts = b.name.toLowerCase().startsWith(q) ? 2 : b.name.toLowerCase().includes(q) ? 1 : 0;
            return bStarts - aStarts;
          });
        } else {
          list = [...list].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
        }
        break;
      case 'featured':
      default:
        list = [...list].sort((a, b) => {
          const aFeat = a.featured ? 1 : 0;
          const bFeat = b.featured ? 1 : 0;
          if (aFeat !== bFeat) return bFeat - aFeat;
          return (a.sort_order ?? 99) - (b.sort_order ?? 99);
        });
        break;
    }

    return list;
  }, [products, selectedCategory, selectedFrameShapes, selectedFaceShapes, selectedOccasions, searchQuery, sortBy, frameShapes]);

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 block mb-2">
          {language === 'id' ? 'Koleksi Studio 2026' : 'The 2026 Collection'}
        </span>
        <h1 className="editorial-title text-4xl sm:text-5xl lg:text-6xl text-neutral-900 uppercase mb-4">
          {t('catalog.title', 'All Eyewear')}
        </h1>
        <p className="text-sm text-neutral-500 font-light leading-relaxed">
          {t('catalog.subtitle', 'Architectural silhouettes meticulously crafted from cured Italian acetate and titanium alloys. Filter by silhouette shape, facial contour harmony, and curated occasion.')}
        </p>
      </div>

      {/* Primary Filter & Controls Bar */}
      <div className="relative z-30 bg-neutral-50/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 mb-4 border border-neutral-200/70 shadow-xs flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Category Pill Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-full border border-neutral-200/80 shadow-2xs overflow-x-auto">
            {[
              { id: 'all', label: language === 'id' ? 'Semua Siluet' : 'All Silhouettes' },
              { id: 'sunglasses', label: language === 'id' ? 'Kacamata Hitam' : 'Sunglasses' },
              { id: 'optical', label: language === 'id' ? 'Kacamata Optik' : 'Optical Frames' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleCategoryChange(tab.id as any)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedCategory === tab.id
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Quick Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('catalog.search_placeholder', 'Search models & colors...')}
                className="w-full bg-white pl-9 pr-8 py-2 rounded-full border border-neutral-200 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal
                size={14}
                className="text-neutral-400 hidden sm:inline"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white px-3 sm:px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-700 focus:outline-none focus:border-black cursor-pointer shadow-2xs hover:border-neutral-400 transition-colors"
                aria-label="Sort products"
              >
                <option value="featured">{t('catalog.sort_featured', 'Featured')}</option>
                <option value="relevant">{language === 'id' ? 'Paling Relevan' : 'Most relevant'}</option>
                <option value="best-selling">{language === 'id' ? 'Terlaris' : 'Best selling'}</option>
                <option value="title-asc">{t('catalog.sort_name_az', 'Alphabetically, A-Z')}</option>
                <option value="title-desc">{t('catalog.sort_name_za', 'Alphabetically, Z-A')}</option>
                <option value="price-asc">{t('catalog.sort_price_low', 'Price, low to high')}</option>
                <option value="price-desc">{t('catalog.sort_price_high', 'Price, high to low')}</option>
                <option value="date-asc">{language === 'id' ? 'Tanggal: Lama ke Baru' : 'Date, old to new'}</option>
                <option value="date-desc">{t('catalog.sort_date_new', 'Date, new to old')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Discovery Attribute Popovers Row */}
        <div className="pt-2 border-t border-neutral-200/60 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mr-1 hidden sm:inline">
            {t('catalog.refine_by', 'Refine By:')}
          </span>

          <FilterPopover
            label={t('catalog.filter_shape', 'Frame Shape')}
            options={frameShapes}
            selectedIds={selectedFrameShapes}
            onToggle={toggleFrameShape}
            onClear={() => selectedFrameShapes.forEach(id => toggleFrameShape(id))}
          />

          <FilterPopover
            label={t('catalog.filter_face_shape', 'Face Shape')}
            options={faceShapes}
            selectedIds={selectedFaceShapes}
            onToggle={toggleFaceShape}
            onClear={() => selectedFaceShapes.forEach(id => toggleFaceShape(id))}
          />

          <FilterPopover
            label={t('catalog.filter_occasion', 'Occasion')}
            options={occasions}
            selectedIds={selectedOccasions}
            onToggle={toggleOccasion}
            onClear={() => selectedOccasions.forEach(id => toggleOccasion(id))}
          />

          {hasAnyFilterActive && (
            <button
              onClick={() => {
                handleCategoryChange('all');
                resetDiscoveryFilters();
              }}
              className="ml-auto text-xs text-neutral-500 hover:text-black font-bold uppercase tracking-wider underline underline-offset-2 px-2"
            >
              {language === 'id' ? 'RESET SEMUA' : 'RESET ALL'}
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 px-1">
          <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider text-[10px]">
            {language === 'id' ? 'FILTER AKTIF:' : 'ACTIVE FILTERS:'}
          </span>
          {activeChips.map((chip) => (
            <span
              key={`${chip.group}-${chip.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider shadow-2xs"
            >
              <span>{chip.label}</span>
              <button
                onClick={chip.onRemove}
                className="hover:text-neutral-300 rounded-full p-0.5"
                title={`Remove ${chip.label}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            onClick={resetDiscoveryFilters}
            className="text-xs text-neutral-500 hover:text-black font-bold uppercase tracking-wider ml-2 underline"
          >
            {language === 'id' ? 'HAPUS SEMUA' : 'CLEAR ALL'}
          </button>
        </div>
      )}

      {/* Active Count Bar */}
      <div className="flex items-center justify-between text-xs text-neutral-500 font-medium mb-6 px-1">
        <div>
          {language === 'id' ? (
            <>Menampilkan <strong className="text-neutral-900">{filteredProducts.length}</strong> siluet</>
          ) : (
            <>Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> styles</>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-neutral-50 rounded-3xl border border-neutral-200/60 p-8">
          <p className="text-base font-bold text-neutral-800 mb-2">
            {t('catalog.no_products', 'No frames matched your criteria')}
          </p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
            {language === 'id'
              ? 'Coba sesuaikan filter pencarian Anda atau hapus kata kunci yang dimasukkan.'
              : 'Try adjusting your discovery filters, switching face shapes, or clearing search keywords.'}
          </p>
          <AnimatedButton
            type="button"
            variant="dark"
            onClick={() => {
              handleCategoryChange('all');
              resetDiscoveryFilters();
            }}
            className="px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold"
          >
            {t('catalog.clear_filters', 'View All Silhouettes')}
          </AnimatedButton>
        </div>
      )}
    </div>
  );
};

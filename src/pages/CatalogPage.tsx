import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import { ProductCard } from '../components/catalog/ProductCard';
import { CatalogFilterDrawer } from '../components/catalog/CatalogFilterDrawer';
import { ProductCategory } from '../types/database';
import { useLanguageStore } from '../store/useLanguageStore';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const activeFilterCount =
    selectedFrameShapes.length + selectedFaceShapes.length + selectedOccasions.length;

  // Filter & Sort Logic
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

    // 6. Sorting Logic
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
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto min-h-screen">
      {/* Sleek Direct Editorial Header */}
      <div className="mb-6 sm:mb-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-400 block mb-1">
          {language === 'id' ? 'Koleksi Studio 2026' : 'The 2026 Collection'}
        </span>
        <h1 className="text-xl sm:text-2xl font-medium tracking-[0.14em] uppercase text-neutral-900">
          {selectedCategory === 'sunglasses'
            ? (language === 'id' ? 'Kacamata Hitam' : 'Sunglasses')
            : selectedCategory === 'optical'
            ? (language === 'id' ? 'Kacamata Optik' : 'Optical Frames')
            : t('catalog.title', 'All Eyewear')}
        </h1>
      </div>

      {/* Horizontal Category Navigation (Gucci Style) */}
      <nav
        className="flex items-center gap-6 sm:gap-10 pb-3 mb-6 border-b border-neutral-200/80 overflow-x-auto no-scrollbar"
        aria-label="Product categories"
      >
        {[
          { id: 'all', label: language === 'id' ? 'Semua Siluet' : 'All Silhouettes' },
          { id: 'sunglasses', label: language === 'id' ? 'Kacamata Hitam' : 'Sunglasses' },
          { id: 'optical', label: language === 'id' ? 'Kacamata Optik' : 'Optical Frames' },
        ].map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleCategoryChange(tab.id as any)}
              className={`text-xs sm:text-[13px] uppercase tracking-[0.16em] transition-colors whitespace-nowrap pb-2 -mb-3 border-b-2 ${
                isActive
                  ? 'font-bold text-neutral-900 border-neutral-900'
                  : 'font-normal text-neutral-400 hover:text-neutral-800 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Inline Metadata & Control Bar (XX Items sorted by Recommended | Search & Filters) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Left: Item Counter & Inline Sort Trigger */}
        <div className="flex items-center gap-1.5 text-xs sm:text-[13px] text-neutral-700 tracking-wide">
          <span>
            <strong className="font-semibold text-neutral-900">{filteredProducts.length}</strong>{' '}
            {language === 'id' ? 'Siluet diurutkan dari' : 'Items sorted by'}
          </span>
          <div className="relative inline-flex items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-transparent font-medium underline underline-offset-4 decoration-neutral-400 hover:decoration-neutral-900 text-neutral-900 cursor-pointer pr-4 focus:outline-none focus:ring-0 transition-colors"
              aria-label="Sort products"
            >
              <option value="featured">{t('catalog.sort_featured', 'Recommended')}</option>
              <option value="relevant">{language === 'id' ? 'Paling Relevan' : 'Most relevant'}</option>
              <option value="best-selling">{language === 'id' ? 'Terlaris' : 'Best selling'}</option>
              <option value="title-asc">{t('catalog.sort_name_az', 'Alphabetically, A-Z')}</option>
              <option value="title-desc">{t('catalog.sort_name_za', 'Alphabetically, Z-A')}</option>
              <option value="price-asc">{t('catalog.sort_price_low', 'Price, low to high')}</option>
              <option value="price-desc">{t('catalog.sort_price_high', 'Price, high to low')}</option>
              <option value="date-asc">{language === 'id' ? 'Tanggal: Lama ke Baru' : 'Date, old to new'}</option>
              <option value="date-desc">{t('catalog.sort_date_new', 'Date, new to old')}</option>
            </select>
            <ChevronDown size={11} className="absolute right-0 pointer-events-none text-neutral-600" />
          </div>
        </div>

        {/* Right: Integrated Minimal Search & Filter Drawer Trigger */}
        <div className="flex items-center gap-5 ml-auto">
          {/* Minimal Search Input */}
          <div className="relative flex items-center">
            <div
              className={`flex items-center transition-all duration-300 ${
                isSearchOpen || searchQuery
                  ? 'w-44 sm:w-56 border-b border-neutral-900'
                  : 'w-6'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-neutral-500 hover:text-black transition-colors"
                aria-label="Search silhouettes"
              >
                <Search size={15} />
              </button>
              {(isSearchOpen || searchQuery) && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari model & warna...' : 'Search silhouettes...'}
                  autoFocus
                  className="w-full bg-transparent pl-2.5 pr-5 py-0.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none"
                />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-neutral-400 hover:text-black absolute right-0"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Filters (+) Trigger */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] font-semibold text-neutral-900 hover:text-neutral-500 transition-colors py-1 cursor-pointer"
          >
            <SlidersHorizontal size={13} />
            <span>{language === 'id' ? 'FILTER' : 'FILTERS'}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[9px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 pt-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {language === 'id' ? 'FILTER AKTIF:' : 'ACTIVE FILTERS:'}
          </span>
          {activeChips.map((chip) => (
            <span
              key={`${chip.group}-${chip.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[11px] tracking-wider uppercase border border-neutral-200/60"
            >
              <span>{chip.label}</span>
              <button
                onClick={chip.onRemove}
                className="hover:text-black text-neutral-400 transition-colors"
                title={`Remove ${chip.label}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            onClick={resetDiscoveryFilters}
            className="text-[11px] text-neutral-500 hover:text-black font-semibold uppercase tracking-wider ml-2 underline underline-offset-2"
          >
            {language === 'id' ? 'HAPUS SEMUA' : 'CLEAR ALL'}
          </button>
        </div>
      )}

      {/* Hairline Editorial Grid: 2 Columns on Mobile, 3 Columns on Desktop */}
      {filteredProducts.length > 0 ? (
        <div className="border-t border-l border-neutral-200/80 grid grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 sm:py-32 border border-dashed border-neutral-200 p-8 my-6">
          <p className="text-sm font-semibold tracking-wider uppercase text-neutral-900 mb-2">
            {t('catalog.no_products', 'No frames matched your criteria')}
          </p>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
            {language === 'id'
              ? 'Coba sesuaikan filter pencarian Anda atau hapus kata kunci yang dimasukkan.'
              : 'Try adjusting your discovery filters or clearing search keywords.'}
          </p>
          <button
            type="button"
            onClick={() => {
              handleCategoryChange('all');
              resetDiscoveryFilters();
              setSearchQuery('');
            }}
            className="px-6 py-2.5 bg-neutral-900 text-white hover:bg-black text-xs uppercase tracking-[0.16em] font-semibold transition-colors"
          >
            {t('catalog.clear_filters', 'View All Silhouettes')}
          </button>
        </div>
      )}

      {/* Slide-out Luxury Filter Drawer */}
      <CatalogFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        frameShapes={frameShapes}
        faceShapes={faceShapes}
        occasions={occasions}
        selectedFrameShapes={selectedFrameShapes}
        selectedFaceShapes={selectedFaceShapes}
        selectedOccasions={selectedOccasions}
        onToggleFrameShape={toggleFrameShape}
        onToggleFaceShape={toggleFaceShape}
        onToggleOccasion={toggleOccasion}
        onResetAll={resetDiscoveryFilters}
        totalMatches={filteredProducts.length}
        language={language}
      />
    </div>
  );
};

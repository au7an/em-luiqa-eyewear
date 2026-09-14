import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { ProductCard } from '../catalog/ProductCard';
import { useLanguageStore } from '../../store/useLanguageStore';

export const FeaturedProducts: React.FC = () => {
  const products = useProductStore((state) => state.products);
  const { t } = useLanguageStore();
  const featured = products
    .filter((p) => p.published && (p.featured ?? true))
    .slice(0, 4);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto border-t border-neutral-100">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 block mb-2">
            {t('home.featured.eyebrow', 'Selected Silhouettes')}
          </span>
          <h2 className="editorial-title text-3xl sm:text-4xl text-neutral-900 uppercase">
            {t('home.featured.title', 'Signature Pieces')}
          </h2>
        </div>

        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-neutral-900 hover:opacity-70 transition-opacity"
        >
          <span>{t('home.featured.view_all', 'View All 2026 Collection')}</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

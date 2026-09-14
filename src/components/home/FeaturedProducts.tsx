import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { ProductCard } from '../catalog/ProductCard';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AnimatedButton } from '../common/AnimatedButton';

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

        <AnimatedButton
          to="/catalog"
          variant="outline-dark"
          className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold"
        >
          <span>{t('home.featured.view_all', 'View All 2026 Collection')}</span>
          <ArrowRight size={15} />
        </AnimatedButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

import React, { useEffect } from 'react';
import { Tag, ArrowUpRight } from 'lucide-react';
import { usePromotionStore } from '../../store/usePromotionStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const PromoBanner: React.FC = () => {
  const { activePromotions, loadActivePromotions } = usePromotionStore();
  const { getProductWALink } = useSettingsStore();

  useEffect(() => {
    loadActivePromotions();
  }, [loadActivePromotions]);

  if (!activePromotions || activePromotions.length === 0) return null;

  const promo = activePromotions[0];

  const targetLink = promo.cta_url || getProductWALink(`Promo: ${promo.title}`);

  return (
    <section className="py-10 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-8 sm:p-12 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        {promo.image_url && (
          <img
            src={promo.image_url}
            alt={promo.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
          />
        )}

        <div className="relative z-10 max-w-xl space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-semibold tracking-wider uppercase backdrop-blur-xs">
            <Tag size={12} />
            <span>{promo.price_label || 'Exclusive Studio Offer'}</span>
          </div>

          <h3 className="editorial-title text-2xl sm:text-3xl lg:text-4xl text-white uppercase">
            {promo.title}
          </h3>

          <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
            {promo.description || promo.subtitle}
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <a
            href={targetLink}
            target={targetLink.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white text-neutral-900 hover:bg-neutral-200 px-8 py-3.5 rounded-full font-semibold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
          >
            <span>{promo.cta_label || 'Consult via WhatsApp'}</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
};

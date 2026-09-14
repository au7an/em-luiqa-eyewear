import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';

export const CollectionGrid: React.FC = () => {
  const { t, language } = useLanguageStore();

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 block mb-2">
            {t('home.collections.eyebrow', 'Curated Categories')}
          </span>
          <h2 className="editorial-title text-3xl sm:text-4xl lg:text-5xl text-neutral-900 uppercase">
            {t('home.collections.title', 'Sculptural Lines')}
          </h2>
        </div>
        <p className="text-sm text-neutral-500 max-w-md font-light">
          {t('home.collections.subtitle', 'Engineered for distinctive presence. Explore the duality between solar protection and refined everyday optical vision.')}
        </p>
      </div>

      {/* 2-Column Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Sunglasses Banner */}
        <Link
          to="/catalog?category=sunglasses"
          className="group relative h-[460px] sm:h-[540px] rounded-3xl overflow-hidden bg-neutral-900 flex flex-col justify-end p-8 sm:p-12 shadow-sm"
        >
          <img
            src="/assets/images/campaign_hero1.jpg"
            alt="Sunglasses Collection"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          <div className="relative z-10 text-white">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-300 block mb-2">
              01 / {language === 'id' ? 'Proteksi Matahari Maksimal' : 'High Solar Protection'}
            </span>
            <h3 className="editorial-title text-2xl sm:text-3xl lg:text-4xl text-white uppercase mb-3">
              {t('home.collections.sunglasses_title', 'Sunglasses Series')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-sm mb-6 line-clamp-2">
              {t('home.collections.sunglasses_desc', 'Deep tinted polarized UV400 lenses housed in handcrafted amber and obsidian translucent acetates.')}
            </p>

            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-white group-hover:translate-x-2 transition-transform">
              <span>{language === 'id' ? 'Lihat Kacamata Hitam' : 'Explore Sunglasses'}</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </Link>

        {/* Optical Banner */}
        <Link
          to="/catalog?category=optical"
          className="group relative h-[460px] sm:h-[540px] rounded-3xl overflow-hidden bg-neutral-900 flex flex-col justify-end p-8 sm:p-12 shadow-sm"
        >
          <img
            src="/assets/images/campaign_hero2.jpg"
            alt="Optical Collection"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          <div className="relative z-10 text-white">
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-neutral-300 block mb-2">
              02 / {language === 'id' ? 'Presisi Optik Studio' : 'Studio Precision'}
            </span>
            <h3 className="editorial-title text-2xl sm:text-3xl lg:text-4xl text-white uppercase mb-3">
              {t('home.collections.optical_title', 'Optical Laboratory')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-sm mb-6 line-clamp-2">
              {t('home.collections.optical_desc', 'Architectural square and round silhouettes engineered with anti-blue light coating and ultra-light titanium alloys.')}
            </p>

            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-white group-hover:translate-x-2 transition-transform">
              <span>{language === 'id' ? 'Lihat Kacamata Optik' : 'Explore Optical Frames'}</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </Link>

      </div>
    </section>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, ArrowUpRight } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export const LensShowcase: React.FC = () => {
  const { getProductWALink } = useSettingsStore();
  const { t, language } = useLanguageStore();

  const categories = [
    {
      title: 'Single Vision',
      tag: language === 'id' ? 'Kejernihan Penglihatan Harian' : 'Everyday Optical Clarity',
      desc: language === 'id'
        ? 'Lensa CR-39 & resin indeks tinggi berlapis hard multi-coat presisi untuk rabun jauh atau membaca.'
        : 'Precision hard multi-coat CR-39 & high-index lenses for clear distance or reading correction.',
      badge: language === 'id' ? 'Mulai Rp 150rb' : 'From IDR 150K',
    },
    {
      title: 'Blue Control Defense',
      tag: language === 'id' ? 'Proteksi Layar Digital' : 'Digital Screen Filter',
      desc: language === 'id'
        ? 'Filter radiasi sinar biru 420nm dari layar smartphone & monitor untuk mencegah mata lelah.'
        : 'High-energy 420nm blue-violet light filtration to reduce eye fatigue during screen work.',
      badge: language === 'id' ? 'Mulai Rp 250rb' : 'From IDR 250K',
    },
    {
      title: 'Photochromic Transition',
      tag: language === 'id' ? 'Transisi Otomatis Sinar UV' : 'Adaptive UV Sunlight Tint',
      desc: language === 'id'
        ? 'Bening jernih di dalam ruangan dan otomatis menggelap menjadi kacamata hitam di bawah terik matahari.'
        : 'Intelligent fast darkening outdoors under sunlight while returning crystal clear indoors.',
      badge: language === 'id' ? 'Mulai Rp 350rb' : 'From IDR 350K',
    },
    {
      title: 'Progressive Multifocal',
      tag: language === 'id' ? 'Digital Freeform Tanpa Garis' : 'Digital Freeform Corridor',
      desc: language === 'id'
        ? 'Koreksi jarak jauh, menengah, dan dekat tanpa batas garis yang mengganggu. Sangat nyaman dan alami.'
        : 'Seamless vision at all distances without visible lines. Wide corridor for natural comfort.',
      badge: language === 'id' ? 'Mulai Rp 650rb' : 'From IDR 650K',
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto border-t border-neutral-100">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">
            <Layers size={13} />
            {t('home.lens_showcase.eyebrow', 'Optical Precision')}
          </span>
          <h2 className="editorial-title text-3xl sm:text-4xl lg:text-5xl text-neutral-900 uppercase">
            {t('home.lens_showcase.title', 'Custom Lens Laboratory')}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/lenses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            <span>{language === 'id' ? 'Lihat Semua Lensa' : 'Explore All Lenses'}</span>
            <ArrowRight size={14} />
          </Link>

          <a
            href={getProductWALink(language === 'id' ? 'Konsultasi Layanan Lensa' : 'Lens Consultation Inquiry')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-900 text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            <span>{t('home.lens_showcase.consult_cta', 'Consult via WhatsApp')}</span>
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>

      {/* 4-Category Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="bg-[#f8f8fa] rounded-2xl p-6 sm:p-7 border border-neutral-200/60 hover:border-neutral-400 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                <span>0{idx + 1}</span>
                <span className="text-neutral-800">{cat.badge}</span>
              </div>

              <h3 className="editorial-title text-xl text-neutral-900 uppercase mb-1">
                {cat.title}
              </h3>
              <span className="text-[11px] font-medium text-neutral-500 block mb-3">
                {cat.tag}
              </span>

              <p className="text-xs text-neutral-600 font-light leading-relaxed">
                {cat.desc}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-200/70">
              <Link
                to="/lenses"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-900 hover:opacity-75 inline-flex items-center gap-1"
              >
                <span>{language === 'id' ? 'Pelajari Lebih Lanjut' : 'Learn More'}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

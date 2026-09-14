import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, ArrowUpRight } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AnimatedButton } from '../common/AnimatedButton';

export const LensShowcase: React.FC = () => {
  const { getProductWALink } = useSettingsStore();
  const { t, language } = useLanguageStore();

  const categories = [
    {
      badge: 'Blue Shield',
      title: 'Digital Armor',
      tag: 'Office / Screen Time',
      desc:
        language === 'id'
          ? 'Memblokir 99.9% radiasi sinar biru berbahaya dari monitor dan smartphone. Mencegah mata lelah dan sakit kepala.'
          : 'Blocks 99.9% harmful HEV blue-violet spectrum. Alleviates digital eye fatigue and optimizes contrast.',
    },
    {
      badge: 'Photochromic',
      title: 'Adaptive Sun',
      tag: 'Indoor & Outdoor Transition',
      desc:
        language === 'id'
          ? 'Transisi otomatis menjadi gelap saat terkena sinar matahari luar, kembali bening kristal saat di dalam ruangan.'
          : 'Instant molecular response shifts from crystal clear indoors to intense polarized smoke in outdoor daylight.',
    },
    {
      badge: 'High Index',
      title: 'Ultra Thin 1.67 / 1.74',
      tag: 'High Prescription Comfort',
      desc:
        language === 'id'
          ? 'Hingga 45% lebih tipis dan ringan untuk minus tinggi. Estetika tepi frame tetap ramping tanpa distorsi mata.'
          : 'Up to 45% lighter and flatter profiles for strong prescriptions. Zero edge magnification distortion.',
    },
    {
      badge: 'Polarized Pro',
      title: 'Chromashift Tint',
      tag: 'Driving & Marine Optics',
      desc:
        language === 'id'
          ? 'Meredam silau permukaan aspal dan air secara total dengan kontras warna alami yang tajam dan menyejukkan.'
          : 'Maximum glare elimination and chromatic definition for high-contrast driving and coastal environments.',
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
          <AnimatedButton
            to="/lenses"
            variant="dark"
            className="px-6 py-3 rounded-full text-xs uppercase tracking-wider font-semibold"
          >
            <span>{language === 'id' ? 'Lihat Semua Lensa' : 'Explore All Lenses'}</span>
            <ArrowRight size={14} />
          </AnimatedButton>

          <AnimatedButton
            href={getProductWALink(language === 'id' ? 'Konsultasi Layanan Lensa' : 'Lens Consultation Inquiry')}
            target="_blank"
            rel="noreferrer"
            variant="outline-dark"
            className="px-6 py-3 rounded-full text-xs uppercase tracking-wider font-semibold"
          >
            <span>{t('home.lens_showcase.consult_cta', 'Consult via WhatsApp')}</span>
            <ArrowUpRight size={14} />
          </AnimatedButton>
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

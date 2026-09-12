import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, ArrowUpRight } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const LensShowcase: React.FC = () => {
  const { getProductWALink } = useSettingsStore();

  const categories = [
    {
      title: 'Single Vision',
      tag: 'Everyday Optical Clarity',
      desc: 'Precision hard multi-coat CR-39 & high-index lenses for clear distance or reading correction.',
      badge: 'From IDR 150K',
    },
    {
      title: 'Blue Control Defense',
      tag: 'Digital Screen Filter',
      desc: 'High-energy 420nm blue-violet light filtration to reduce eye fatigue during screen work.',
      badge: 'From IDR 250K',
    },
    {
      title: 'Photochromic Transition',
      tag: 'Adaptive UV Sunlight Tint',
      desc: 'Intelligent fast darkening outdoors under sunlight while returning crystal clear indoors.',
      badge: 'From IDR 350K',
    },
    {
      title: 'Progressive Multifocal',
      tag: 'Digital Freeform Corridor',
      desc: 'Seamless vision at all distances without visible lines. Wide corridor for natural comfort.',
      badge: 'From IDR 650K',
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto border-t border-neutral-100">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">
            <Layers size={13} />
            Optical Precision
          </span>
          <h2 className="editorial-title text-3xl sm:text-4xl lg:text-5xl text-neutral-900 uppercase">
            Custom Lens Laboratory
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/lenses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            <span>Explore All Lenses</span>
            <ArrowRight size={14} />
          </Link>

          <a
            href={getProductWALink('Lens Consultation Inquiry')}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-900 text-xs uppercase tracking-wider font-semibold transition-colors"
          >
            <span>Consult via WhatsApp</span>
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
                <span>Learn More</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

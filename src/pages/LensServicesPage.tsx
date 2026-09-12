import React, { useState, useEffect, useMemo } from 'react';
import { Check, ArrowUpRight, Layers } from 'lucide-react';
import { useLensStore } from '../store/useLensStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { LensCategory } from '../types/database';

export const LensServicesPage: React.FC = () => {
  const { activeLenses, loadActiveLenses } = useLensStore();
  const { getProductWALink, settings } = useSettingsStore();

  const [selectedCategory, setSelectedCategory] = useState<'all' | LensCategory>('all');

  useEffect(() => {
    loadActiveLenses();
  }, [loadActiveLenses]);

  const filteredLenses = useMemo(() => {
    if (selectedCategory === 'all') return activeLenses;
    return activeLenses.filter((l) => l.category === selectedCategory);
  }, [activeLenses, selectedCategory]);

  const categories: { id: 'all' | LensCategory; label: string }[] = [
    { id: 'all', label: 'All Lens Services' },
    { id: 'Single Vision', label: 'Single Vision' },
    { id: 'Specialty', label: 'Specialty & Photochromic' },
    { id: 'Progressive', label: 'Progressive Multifocal' },
    { id: 'Bifocal', label: 'Bifocal' },
  ];

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">
          <Layers size={14} />
          Optical Laboratory
        </span>
        <h1 className="editorial-title text-4xl sm:text-5xl lg:text-6xl text-neutral-900 uppercase mb-4">
          Custom Lens Services
        </h1>
        <p className="text-sm text-neutral-500 font-light leading-relaxed">
          Precision Japanese and European optical coatings custom-fitted to your JEM LUIQA frame. From digital blue defense to seamless freeform progressive multifocals.
        </p>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-2 p-1.5 bg-neutral-50 rounded-full border border-neutral-200/80 shadow-2xs overflow-x-auto max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lens Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
        {filteredLenses.map((lens) => (
          <div
            key={lens.id}
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 hover:border-neutral-900 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Category & Badge */}
              <div className="flex items-center justify-between mb-3 text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
                <span>{lens.category}</span>
                <span className="text-neutral-900 font-bold">
                  {lens.starting_price.startsWith('IDR') ? `From ${lens.starting_price}` : lens.starting_price}
                </span>
              </div>

              {/* Title */}
              <h3 className="editorial-title text-xl sm:text-2xl text-neutral-900 uppercase mb-2">
                {lens.name}
              </h3>

              <p className="text-xs text-neutral-600 font-light leading-relaxed mb-6">
                {lens.short_description || lens.description}
              </p>

              {/* Feature List */}
              {lens.features && lens.features.length > 0 && (
                <div className="space-y-2 mb-6 pt-4 border-t border-neutral-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                    Technology & Features
                  </span>
                  {lens.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 text-xs text-neutral-700 font-medium"
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check size={11} strokeWidth={2.5} />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended For */}
              {lens.recommended_for && (
                <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-600 mb-6">
                  <strong className="text-neutral-900 block font-semibold mb-0.5">
                    Recommended For:
                  </strong>
                  <p className="font-light">{lens.recommended_for}</p>
                </div>
              )}
            </div>

            {/* Consultation CTA */}
            <div className="pt-4 border-t border-neutral-100">
              <a
                href={getProductWALink('Any Frame (Consultation)', undefined, lens.name)}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white py-3.5 px-6 rounded-full font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all hover:shadow-md active:scale-98"
              >
                <span>Consult via WhatsApp</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Optical Consultation Banner */}
      <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-bold block mb-2">
            Bespoke Prescription Advisory
          </span>
          <h2 className="editorial-title text-2xl sm:text-3xl lg:text-4xl uppercase mb-4 text-white">
            Need Guidance with Your Prescription?
          </h2>
          <p className="text-sm text-neutral-300 font-light leading-relaxed mb-8">
            Send a photo or copy of your doctor's optical prescription (minus, plus, cylinder, or axis) to our concierge. We will recommend the optimal lens index and coating configuration for your lifestyle.
          </p>

          <a
            href={`https://wa.me/${(settings.whatsapp_number || '6281234567890').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              'Halo JEM LUIQA Concierge, saya ingin mengirimkan foto resep dokter untuk konsultasi lensa kacamata.'
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white text-neutral-900 hover:bg-neutral-200 px-8 py-4 rounded-full font-semibold text-xs uppercase tracking-wider transition-colors shadow-lg"
          >
            <span>Send Prescription on WhatsApp</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </div>
  );
};

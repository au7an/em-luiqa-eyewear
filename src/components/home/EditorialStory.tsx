import { Link } from 'react-router-dom';
import { Sparkles, Shield, ArrowRight } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';

export const EditorialStory: React.FC = () => {
  const { language } = useLanguageStore();

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-8 bg-[#f7f7f9] border-y border-neutral-200/60">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text / Manifesto */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200 text-neutral-800 text-[11px] font-bold tracking-[0.2em] uppercase">
              <Sparkles size={13} />
              {language === 'id' ? 'Manifesto Craftsmanship' : 'The Craft Manifesto'}
            </span>

            <h2 className="editorial-title text-3xl sm:text-4xl lg:text-5xl text-neutral-900 uppercase leading-tight">
              {language === 'id' ? (
                <>
                  Didesain oleh Visi. <br />
                  <span className="text-neutral-400">Dikerjakan dengan Tangan.</span>
                </>
              ) : (
                <>
                  Engineered by Vision. <br />
                  <span className="text-neutral-400">Crafted by Hand.</span>
                </>
              )}
            </h2>

            <p className="text-neutral-600 font-light leading-relaxed text-sm sm:text-base">
              {language === 'id'
                ? 'Setiap frame Jem Luiqa berawal dari balok asetat selulosa murni Italia, diproses dan dipoles tangan oleh pengrajin ahli melalui lebih dari 82 tahapan presisi.'
                : 'Every Jem Luiqa frame begins as raw block Italian cellulose acetate, cured for ninety days before being carved, beveled, and polished by master artisans over eighty-two meticulous steps.'}
            </p>

            <p className="text-neutral-600 font-light leading-relaxed text-sm sm:text-base">
              {language === 'id'
                ? 'Kami menolak tren sesaat demi menciptakan bentuk arsitektural yang abadi. Proporsi hidung ergonomis dan distribusi bobot seimbang memberikan kenyamanan sejati sepanjang hari.'
                : 'We reject fleeting trends in favor of structural permanence. Our ergonomic bridge proportions and balanced temple weight distribution guarantee effortless comfort through relentless days.'}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-neutral-900 heading-font mb-1">
                  82+
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  {language === 'id' ? 'Tahapan Finishing Tangan' : 'Hand-finished Steps'}
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold text-neutral-900 heading-font mb-1">
                  100%
                </div>
                <div className="text-xs text-neutral-500 uppercase tracking-wider">
                  {language === 'id' ? 'Kejernihan UV400 & Polarized' : 'UV400 & Polarized Clarity'}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/lookbook"
                className="inline-flex items-center gap-2 bg-black text-white hover:bg-neutral-800 px-6 py-3.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors"
              >
                <span>{language === 'id' ? 'Lihat Lookbook 2026' : 'View 2026 Lookbook'}</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Image Composition */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-neutral-900">
              <img
                src="/assets/images/lookbook1.jpg"
                alt="Craftsmanship Atelier"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-white/80 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Shield size={18} className="text-neutral-900" />
                  <span className="text-xs uppercase font-bold tracking-wider text-neutral-900">
                    {language === 'id' ? 'Penyetelan Frame Seumur Hidup' : 'Lifetime Frame Alignment'}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 font-light">
                  {language === 'id'
                    ? 'Layanan gratis penyesuaian fitting dan keseimbangan frame di studio atelier kami.'
                    : 'Complimentary fitting and tune-up adjustments across all flagship studios worldwide.'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

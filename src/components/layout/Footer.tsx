import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useLanguageStore } from '../../store/useLanguageStore';

export const Footer: React.FC = () => {
  const { settings, loadSettings } = useSettingsStore();
  const { language, openGateway, t } = useLanguageStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const cleanPhone = (settings.whatsapp_number || '6281234567890').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#0a0a0c] text-white pt-20 pb-12 px-4 sm:px-8 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-neutral-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <Link to="/" className="inline-block mb-4">
                <span className="logo-title text-2xl tracking-[0.25em] font-bold text-white uppercase">
                  {settings.brand_name || 'Jem Luiqa'}
                </span>
                <span className="block text-[10px] tracking-[0.4em] text-neutral-400 uppercase font-medium">
                  {settings.tagline || 'Eyewear Studio'}
                </span>
              </Link>
              <p className="text-neutral-400 text-sm max-w-sm leading-relaxed mb-6 font-light">
                {settings.footer_text || t('footer.brand_desc')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={17} />
                </a>
              )}

              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  language === 'id'
                    ? 'Halo JEM LUIQA Concierge, saya ingin berkonsultasi mengenai produk dan lensa kacamata.'
                    : 'Hello JEM LUIQA Concierge, I would like to inquire about your eyewear and bespoke lenses.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
                aria-label="WhatsApp Concierge"
              >
                <Phone size={17} />
              </a>

              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-colors"
                  aria-label="Email"
                >
                  <Mail size={17} />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-5">
              {t('footer.navigation_title', 'Collections')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/catalog?category=sunglasses" className="text-neutral-300 hover:text-white transition-colors">
                  {language === 'id' ? 'Kacamata Hitam' : 'Sunglasses Series'}
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=optical" className="text-neutral-300 hover:text-white transition-colors">
                  {language === 'id' ? 'Kacamata Optik' : 'Optical Frames'}
                </Link>
              </li>
              <li>
                <Link to="/lenses" className="text-neutral-300 hover:text-white transition-colors">
                  {t('navbar.lenses', 'Custom Lens Services')}
                </Link>
              </li>
              <li>
                <Link to="/lookbook" className="text-neutral-300 hover:text-white transition-colors">
                  {t('navbar.lookbook', 'Editorial Lookbook')}
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-neutral-300 hover:text-white transition-colors">
                  {language === 'id' ? 'Semua Kacamata' : 'All Eyewear'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Service */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-5">
              {language === 'id' ? 'Layanan Klien' : 'Client Concierge'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/contact" className="text-neutral-300 hover:text-white transition-colors">
                  {language === 'id' ? 'Kontak & Fitting Studio' : 'Contact & Studio Fitting'}
                </Link>
              </li>
              <li>
                <a
                  href={settings.shopee_url || 'https://shopee.co.id'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  Official Shopee Store <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    language === 'id'
                      ? 'Halo, saya ingin menanyakan informasi pengiriman dan garansi kacamata Jem Luiqa.'
                      : 'Hello, I would like to inquire about warranty and insured shipping for Jem Luiqa eyewear.'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  {language === 'id' ? 'Garansi & Perawatan' : 'Warranty & Care'} <ArrowUpRight size={13} />
                </a>
              </li>
              <li>
                <Link to="/admin" className="text-neutral-500 hover:text-neutral-300 transition-colors">
                  Studio Portal (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Location */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-5">
              {language === 'id' ? 'Lokasi Atelier' : 'Studio Space'}
            </h4>
            <div className="space-y-3 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">
                    {language === 'id' ? 'Bandung Flagship Atelier' : 'Bandung Flagship Space'}
                  </strong>
                  <p className="leading-relaxed mt-0.5">{settings.address}</p>
                </div>
              </div>

              {settings.google_maps_url && (
                <a
                  href={settings.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-300 hover:text-white hover:underline pt-1"
                >
                  <span>{language === 'id' ? 'Petunjuk Arah' : 'Get Directions'}</span>
                  <ExternalLink size={11} />
                </a>
              )}

              <div className="pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-500">
                {t('footer.hours_weekdays')}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 {settings.brand_name || 'JEM LUIQA'} EYEWEAR. {t('footer.rights_reserved')}
          </div>
          <div className="flex items-center gap-6">
            {/* Language Selector Modal Trigger */}
            <button
              type="button"
              onClick={openGateway}
              className="text-neutral-400 hover:text-white inline-flex items-center gap-1.5 transition-colors underline underline-offset-4"
            >
              <span>{t('footer.switch_language', 'Ubah Bahasa')} ({language.toUpperCase()})</span>
            </button>
            <span className="text-neutral-500">{t('footer.guarantee_acetate')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

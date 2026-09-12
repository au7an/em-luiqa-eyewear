import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Instagram, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const Footer: React.FC = () => {
  const { settings, loadSettings } = useSettingsStore();

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
                {settings.footer_text ||
                  'International avant-garde & optical luxury eyewear. Hand-crafted acetate frames sculpturally engineered to redefine personal vision.'}
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
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Halo JEM LUIQA Concierge, saya ingin berkonsultasi mengenai produk dan lensa kacamata.')}`}
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
              Collections
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/catalog?category=sunglasses" className="text-neutral-300 hover:text-white transition-colors">
                  Sunglasses Series
                </Link>
              </li>
              <li>
                <Link to="/catalog?category=optical" className="text-neutral-300 hover:text-white transition-colors">
                  Optical Frames
                </Link>
              </li>
              <li>
                <Link to="/lenses" className="text-neutral-300 hover:text-white transition-colors">
                  Custom Lens Services
                </Link>
              </li>
              <li>
                <Link to="/lookbook" className="text-neutral-300 hover:text-white transition-colors">
                  Editorial Lookbook
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-neutral-300 hover:text-white transition-colors">
                  All Eyewear
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Service */}
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-400 mb-5">
              Client Concierge
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/contact" className="text-neutral-300 hover:text-white transition-colors">
                  Contact & Studio Fitting
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
                  href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Halo, saya ingin menanyakan informasi pengiriman dan garansi kacamata Jem Luiqa.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors flex items-center gap-1"
                >
                  Warranty & Care <ArrowUpRight size={13} />
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
              Studio Space
            </h4>
            <div className="space-y-3 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Bandung Flagship Space</strong>
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
                  <span>Get Directions</span>
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © 2026 {settings.brand_name || 'JEM LUIQA'} EYEWEAR. All Rights Reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-neutral-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-300 cursor-pointer">Handcrafted Cellulose Acetate</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

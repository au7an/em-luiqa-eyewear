import { create } from 'zustand';
import { SiteSettings } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';

const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: 'JEM LUIQA',
  tagline: 'Define Your Vision',
  instagram_url: 'https://instagram.com/jemluiqa',
  shopee_url: 'https://shopee.co.id',
  whatsapp_number: '6281234567890',
  whatsapp_default_message: 'Hello JEM LUIQA Concierge, I would like to consult regarding eyewear and custom prescription lenses.',
  email: 'concierge@jemluiqa.com',
  address: 'Jl. Cikutra Baru Raya No.1, Neglasari, Cibeunying Kaler, Kota Bandung, Jawa Barat 40123',
  operational_hours: 'Monday – Sunday: 09:00 – 20:00 WIB',
  google_maps_url: 'https://maps.google.com/?q=Jl.+Cikutra+Baru+Raya+baru+No.1,+Neglasari,+Kec.+Cibeunying+Kaler,+Kota+Bandung,+Jawa+Barat+40123',
  footer_text: 'International avant-garde & optical luxury eyewear. Hand-crafted acetate frames sculpturally engineered to redefine personal vision.',
  seo_default_title: 'JEM LUIQA EYEWEAR | Define Your Vision',
  seo_default_description: 'JEM LUIQA EYEWEAR — International avant-garde and optical luxury eyewear. Hand-crafted acetate frames engineered to define your vision.',
};

interface SettingsState {
  settings: SiteSettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<{ success: boolean; error?: string }>;
  getWhatsAppLink: (customMessage?: string) => string;
  getProductWALink: (productName: string, color?: string, lensType?: string) => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  isSaving: false,
  error: null,

  loadSettings: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'general')
        .maybeSingle();

      if (!error && data?.value) {
        set({
          settings: {
            ...DEFAULT_SETTINGS,
            ...data.value,
          },
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to fetch site settings from Supabase:', err);
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings: Partial<SiteSettings>) => {
    const merged = { ...get().settings, ...newSettings };
    set({ isSaving: true, error: null });

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ settings: merged, isSaving: false });
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          {
            key: 'general',
            value: merged,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );

      if (error) {
        set({ isSaving: false, error: error.message });
        return { success: false, error: error.message };
      }

      set({ settings: merged, isSaving: false });
      return { success: true };
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  getWhatsAppLink: (customMessage?: string) => {
    const { whatsapp_number, whatsapp_default_message } = get().settings;
    const phone = (whatsapp_number || '6281234567890').replace(/[^0-9]/g, '');
    const message = customMessage || whatsapp_default_message;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  getProductWALink: (productName: string, color?: string, lensType?: string) => {
    const { whatsapp_number } = get().settings;
    const phone = (whatsapp_number || '6281234567890').replace(/[^0-9]/g, '');
    
    let text = `Hello JEM LUIQA Concierge,\n\nI am interested in:\n• Product: *${productName}*`;
    if (color) {
      text += `\n• Colorway: ${color}`;
    }
    if (lensType) {
      text += `\n• Preferred Lens: *${lensType}*`;
    }
    text += `\n\nI would like to consult regarding custom prescription lenses and availability.\nThank you.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  },
}));

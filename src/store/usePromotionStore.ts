import { create } from 'zustand';
import { Promotion } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';

const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-01',
    title: 'Studio Pairing Bundle',
    slug: 'studio-pairing-bundle',
    subtitle: 'Complimentary Prescription Lens',
    description: 'Purchase any handcrafted optical acetate frame and receive complimentary Single Vision Blue Control anti-radiation lenses.',
    price_label: 'Custom Lens Included',
    image_url: '/assets/images/lookbook4.jpg',
    cta_label: 'Consult via WhatsApp',
    cta_url: '',
    active: true,
    start_date: null,
    end_date: null,
    sort_order: 1,
  },
];

interface PromotionState {
  promotions: Promotion[];
  activePromotions: Promotion[];
  isLoading: boolean;
  error: string | null;

  loadPromotions: () => Promise<void>;
  loadActivePromotions: () => Promise<void>;
  getPromotionById: (id: string) => Promotion | undefined;
  createPromotion: (promo: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; data?: Promotion; error?: string }>;
  updatePromotion: (id: string, promo: Partial<Promotion>) => Promise<{ success: boolean; error?: string }>;
  deletePromotion: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const usePromotionStore = create<PromotionState>((set, get) => ({
  promotions: DEFAULT_PROMOTIONS,
  activePromotions: DEFAULT_PROMOTIONS,
  isLoading: false,
  error: null,

  loadPromotions: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ promotions: DEFAULT_PROMOTIONS, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        set({ promotions: data, isLoading: false });
      } else {
        set({ promotions: DEFAULT_PROMOTIONS, isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load promotions:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  loadActivePromotions: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ activePromotions: DEFAULT_PROMOTIONS.filter((p) => p.active), isLoading: false });
      return;
    }

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const filtered = data.filter((p) => {
          if (p.start_date && new Date(p.start_date) > new Date(now)) return false;
          if (p.end_date && new Date(p.end_date) < new Date(now)) return false;
          return true;
        });

        set({ activePromotions: filtered, isLoading: false });
      } else {
        set({ activePromotions: DEFAULT_PROMOTIONS.filter((p) => p.active), isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load active promotions:', err);
      set({ activePromotions: DEFAULT_PROMOTIONS.filter((p) => p.active), isLoading: false });
    }
  },

  getPromotionById: (id: string) => {
    return get().promotions.find((p) => p.id === id);
  },

  createPromotion: async (promoData) => {
    const supabase = getSupabaseClient();
    const newId = `promo-${Date.now()}`;
    const newPromo: Promotion = {
      ...promoData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!supabase) {
      const updated = [...get().promotions, newPromo];
      set({ promotions: updated });
      return { success: true, data: newPromo };
    }

    try {
      const { data, error } = await supabase
        .from('promotions')
        .insert([promoData])
        .select()
        .single();

      if (error) throw error;

      const updated = [...get().promotions, data];
      set({ promotions: updated });
      get().loadActivePromotions();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updatePromotion: async (id, updatedFields) => {
    const current = get().promotions;
    const optimistic = current.map((p) =>
      p.id === id ? { ...p, ...updatedFields, updated_at: new Date().toISOString() } : p
    );
    set({ promotions: optimistic });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('promotions')
        .update({ ...updatedFields, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      get().loadActivePromotions();
      return { success: true };
    } catch (err: any) {
      set({ promotions: current });
      return { success: false, error: err.message };
    }
  },

  deletePromotion: async (id) => {
    const current = get().promotions;
    const filtered = current.filter((p) => p.id !== id);
    set({ promotions: filtered });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;

      get().loadActivePromotions();
      return { success: true };
    } catch (err: any) {
      set({ promotions: current });
      return { success: false, error: err.message };
    }
  },
}));

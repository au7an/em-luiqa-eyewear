import { create } from 'zustand';
import { LensService } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';

const DEFAULT_LENSES: LensService[] = [
  {
    id: 'lens-01',
    name: 'Classic Single Vision',
    slug: 'classic-single-vision',
    category: 'Single Vision',
    short_description: 'Standard precision clarity lens for distance or near correction.',
    description: 'Clear optical CR-39 and high-index lenses with hard multi-coat anti-scratch protection. Suitable for everyday prescription wear.',
    starting_price: 'IDR 150,000',
    currency: 'IDR',
    features: ['Hard Multi-Coat Anti Scratch', 'Hydrophobic Easy Clean', 'UV380 Protection', '1.56 Index Standard'],
    recommended_for: 'Everyday single-vision correction for distance or reading.',
    sort_order: 1,
    active: true,
  },
  {
    id: 'lens-02',
    name: 'Blue Control Lens',
    slug: 'blue-control-lens',
    category: 'Single Vision',
    short_description: 'Essential digital blue light defense for computer, tablet, and smartphone users.',
    description: 'Advanced optical coating filtering harmful high-energy blue-violet light (400-450nm) while maintaining color fidelity and reducing eye fatigue.',
    starting_price: 'IDR 250,000',
    currency: 'IDR',
    features: ['Anti Blue-Light 420nm Filter', 'Anti-Reflective Coating', 'UV400 Total Block', 'Reduces Digital Eyestrain'],
    recommended_for: 'Professionals & creatives with extensive daily screen time.',
    sort_order: 2,
    active: true,
  },
  {
    id: 'lens-03',
    name: 'Blue Control Shield (High-Index Thin)',
    slug: 'blue-control-shield',
    category: 'Single Vision',
    short_description: 'Ultra-thin blue filter lens optimized for medium to higher prescription strengths.',
    description: 'Engineered with 1.60 / 1.67 high-index resin to significantly reduce lens edge thickness and cosmetic distortion for higher diopters.',
    starting_price: 'IDR 390,000',
    currency: 'IDR',
    features: ['1.60 / 1.67 High-Index Thin Profile', 'Super Blue Cut Filter', 'Super Hydrophobic Oleophobic Coat', 'Impact Resistant'],
    recommended_for: 'Prescriptions above -3.00 requiring lighter, thinner aesthetic lenses.',
    sort_order: 3,
    active: true,
  },
  {
    id: 'lens-04',
    name: 'Blue Control Drive Night & Day',
    slug: 'blue-control-drive',
    category: 'Single Vision',
    short_description: 'Contrast-enhancing anti-glare lens optimized for commuting, night driving, and screens.',
    description: 'Specialized optical filtering minimizing harsh headlight flare, street reflection, and night glare while maintaining high contrast in low-light environments.',
    starting_price: 'IDR 450,000',
    currency: 'IDR',
    features: ['Anti-Glare Night Flare Reduction', 'High-Contrast Visual Clarity', 'Day & Night Dual Performance', 'UV400 & Blue Defense'],
    recommended_for: 'Night drivers, commuters, and light-sensitive individuals.',
    sort_order: 4,
    active: true,
  },
  {
    id: 'lens-05',
    name: 'Photochromic Fast-Transition',
    slug: 'photochromic-fast-transition',
    category: 'Specialty',
    short_description: 'Intelligent adaptive lens switching seamlessly from crystal clear indoor to dark sunglass outdoor.',
    description: 'Rapid molecular transition activated by ambient UV sunlight. Returns quickly to clear indoors with full UV400 sun protection.',
    starting_price: 'IDR 350,000',
    currency: 'IDR',
    features: ['Fast Darkening Transition', 'Clear Indoors Transparency', 'UV400 Full Spectrum Shield', 'Anti-Reflective Finish'],
    recommended_for: 'Those who transition frequently between indoor work and outdoor sunlight.',
    sort_order: 5,
    active: true,
  },
  {
    id: 'lens-06',
    name: 'Blue Chromic (Blue Light + Photochromic)',
    slug: 'blue-chromic',
    category: 'Specialty',
    short_description: 'All-in-one hybrid: full blue light filtering plus adaptive UV sun tinting.',
    description: 'The ultimate dual-protection lens combining indoor digital blue-light filtering with rapid outdoor sunlight darkening.',
    starting_price: 'IDR 490,000',
    currency: 'IDR',
    features: ['Dual Blue Light & UV Photochromic', 'Rapid Responsive Transition', 'Premium Anti-Glare Coating', 'All-in-One Everyday Convenience'],
    recommended_for: 'Users demanding complete digital screen protection and outdoor solar tint in a single pair.',
    sort_order: 6,
    active: true,
  },
  {
    id: 'lens-07',
    name: 'Polarized Sun Prescription',
    slug: 'polarized-sun-prescription',
    category: 'Specialty',
    short_description: 'Maximum glare elimination for sunglasses with custom prescription power.',
    description: 'True polarization filter cutting water, asphalt, and metallic reflections for crisp visual acuity in intense sunlight.',
    starting_price: 'IDR 550,000',
    currency: 'IDR',
    features: ['99.9% Glare Elimination', 'Category 3 Dark Tint (Grey/Brown)', 'UV400 Total Sunblock', 'Prescription Compatible'],
    recommended_for: 'Outdoor sports, driving, maritime, and intense sun exposure.',
    sort_order: 7,
    active: true,
  },
  {
    id: 'lens-08',
    name: 'Custom Progressive Precision',
    slug: 'custom-progressive-precision',
    category: 'Progressive',
    short_description: 'Seamless multifocal lens with wide corridor for natural distance, intermediate, and near vision.',
    description: 'Digital freeform surface technology eliminating visible line bifocal borders for smooth, distortion-free transitions at all focal lengths.',
    starting_price: 'IDR 650,000',
    currency: 'IDR',
    features: ['Digital Freeform Multifocal Surface', 'Wide Intermediate Digital Corridor', 'No Visible Segment Lines', 'Anti-Reflective + Blue Cut Available'],
    recommended_for: 'Individuals experiencing presbyopia requiring clear vision at all distances without switching glasses.',
    sort_order: 8,
    active: true,
  },
  {
    id: 'lens-09',
    name: 'Bifocal Flattop / Kryptok',
    slug: 'bifocal-flattop',
    category: 'Bifocal',
    short_description: 'Traditional distinct dual-segment prescription for dedicated distance and near reading.',
    description: 'Stable dual-focus segment designed for easy reading adaptation and clear distance vision.',
    starting_price: 'IDR 280,000',
    currency: 'IDR',
    features: ['Distinct Dual-Vision Segment', 'Easy Rapid Adaptation', 'Hard Multi-Coat', 'UV Protection'],
    recommended_for: 'Wearers accustomed to classic bifocal segment geometry.',
    sort_order: 9,
    active: true,
  },
];

interface LensState {
  lenses: LensService[];
  activeLenses: LensService[];
  isLoading: boolean;
  error: string | null;

  loadLenses: () => Promise<void>;
  loadActiveLenses: () => Promise<void>;
  getLensById: (id: string) => LensService | undefined;
  createLens: (lens: Omit<LensService, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; data?: LensService; error?: string }>;
  updateLens: (id: string, lens: Partial<LensService>) => Promise<{ success: boolean; error?: string }>;
  deleteLens: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useLensStore = create<LensState>((set, get) => ({
  lenses: DEFAULT_LENSES,
  activeLenses: DEFAULT_LENSES,
  isLoading: false,
  error: null,

  loadLenses: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ lenses: DEFAULT_LENSES, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('lens_services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: LensService[] = data.map((d: any) => ({
          ...d,
          features: Array.isArray(d.features) ? d.features : typeof d.features === 'string' ? JSON.parse(d.features) : [],
        }));
        set({ lenses: formatted, isLoading: false });
      } else {
        set({ lenses: DEFAULT_LENSES, isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load lens services:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  loadActiveLenses: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ activeLenses: DEFAULT_LENSES.filter((l) => l.active), isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('lens_services')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formatted: LensService[] = data.map((d: any) => ({
          ...d,
          features: Array.isArray(d.features) ? d.features : typeof d.features === 'string' ? JSON.parse(d.features) : [],
        }));
        set({ activeLenses: formatted, isLoading: false });
      } else {
        set({ activeLenses: DEFAULT_LENSES.filter((l) => l.active), isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load active lenses:', err);
      set({ activeLenses: DEFAULT_LENSES.filter((l) => l.active), isLoading: false });
    }
  },

  getLensById: (id: string) => {
    return get().lenses.find((l) => l.id === id);
  },

  createLens: async (lensData) => {
    const supabase = getSupabaseClient();
    const newId = `lens-${Date.now()}`;
    const newLens: LensService = {
      ...lensData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!supabase) {
      const updated = [...get().lenses, newLens];
      set({ lenses: updated, activeLenses: updated.filter((l) => l.active) });
      return { success: true, data: newLens };
    }

    try {
      const { data, error } = await supabase
        .from('lens_services')
        .insert([{
          ...lensData,
          features: lensData.features,
        }])
        .select()
        .single();

      if (error) throw error;

      const formatted: LensService = {
        ...data,
        features: Array.isArray(data.features) ? data.features : [],
      };

      const updated = [...get().lenses, formatted];
      set({ lenses: updated });
      get().loadActiveLenses();
      return { success: true, data: formatted };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateLens: async (id, updatedFields) => {
    const current = get().lenses;
    const optimistic = current.map((l) =>
      l.id === id ? { ...l, ...updatedFields, updated_at: new Date().toISOString() } : l
    );
    set({ lenses: optimistic, activeLenses: optimistic.filter((l) => l.active) });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('lens_services')
        .update({
          ...updatedFields,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      get().loadActiveLenses();
      return { success: true };
    } catch (err: any) {
      set({ lenses: current, activeLenses: current.filter((l) => l.active) });
      return { success: false, error: err.message };
    }
  },

  deleteLens: async (id) => {
    const current = get().lenses;
    const filtered = current.filter((l) => l.id !== id);
    set({ lenses: filtered, activeLenses: filtered.filter((l) => l.active) });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('lens_services').delete().eq('id', id);
      if (error) throw error;

      get().loadActiveLenses();
      return { success: true };
    } catch (err: any) {
      set({ lenses: current, activeLenses: current.filter((l) => l.active) });
      return { success: false, error: err.message };
    }
  },
}));

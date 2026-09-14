import { create } from 'zustand';
import { HomepageLayoutSettings, HomeSectionConfig, HomeSectionId } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';

export const DEFAULT_HOMEPAGE_SECTIONS: HomeSectionConfig[] = [
  {
    id: 'promo_banner',
    name: 'Promo & Running Banner',
    description: 'Running announcement ticker showcasing special offers, shipping guarantees, and studio updates.',
    badge: 'Announcement',
    enabled: true,
  },
  {
    id: 'collection_grid',
    name: 'Curated Silhouettes & Collections',
    description: 'Visual category grid highlighting Sunglasses, Optical Atelier, and Limited Acetate editions.',
    badge: 'Navigation',
    enabled: true,
  },
  {
    id: 'featured_products',
    name: 'Featured Eyewear Showcase',
    description: 'Curated product carousel displaying flagship models with pricing and instant purchase actions.',
    badge: 'Products',
    enabled: true,
  },
  {
    id: 'lens_showcase',
    name: 'Lens Technology & Lab Showcase',
    description: 'Educational editorial cards highlighting precision optical coatings, blue-cut, and transition filters.',
    badge: 'Optical Lab',
    enabled: true,
  },
  {
    id: 'editorial_story',
    name: 'Brand Story & Atelier Heritage',
    description: 'Luxury editorial craftsmanship statement and the architectural philosophy behind JEM LUIQA.',
    badge: 'Storytelling',
    enabled: true,
  },
];

export const DEFAULT_HOMEPAGE_LAYOUT: HomepageLayoutSettings = {
  hero_enabled: true,
  sections: DEFAULT_HOMEPAGE_SECTIONS,
};

const LOCAL_STORAGE_KEY = 'jemluiqa_homepage_layout';

interface HomepageLayoutState {
  layout: HomepageLayoutSettings;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;

  loadLayout: () => Promise<void>;
  saveLayout: () => Promise<{ success: boolean; error?: string }>;
  toggleHero: () => void;
  toggleSection: (id: HomeSectionId) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  setSections: (sections: HomeSectionConfig[]) => void;
  applyPreset: (preset: 'rich' | 'focus' | 'default') => void;
}

export const useHomepageLayoutStore = create<HomepageLayoutState>((set, get) => ({
  layout: DEFAULT_HOMEPAGE_LAYOUT,
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false,
  error: null,

  loadLayout: async () => {
    // 1. Try loading from localStorage first for instant hydration
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.sections)) {
          set({ layout: parsed });
        }
      }
    } catch {
      // ignore JSON parse error
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_layout')
        .maybeSingle();

      if (error) throw error;

      if (data?.value && Array.isArray(data.value.sections)) {
        // Merge with defaults in case new sections were introduced in future updates
        const savedSections: HomeSectionConfig[] = data.value.sections;
        const mergedSections = [...savedSections];

        // Add any missing default section to the end
        DEFAULT_HOMEPAGE_SECTIONS.forEach((defSec) => {
          if (!mergedSections.some((s) => s.id === defSec.id)) {
            mergedSections.push(defSec);
          }
        });

        const fullLayout: HomepageLayoutSettings = {
          hero_enabled: data.value.hero_enabled ?? true,
          sections: mergedSections,
        };

        set({ layout: fullLayout, isLoading: false, hasUnsavedChanges: false });
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fullLayout));
        } catch {}
      } else {
        set({ isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load homepage layout from DB, using fallback:', err);
      set({ isLoading: false, error: err.message });
    }
  },

  saveLayout: async () => {
    const current = get().layout;
    set({ isSaving: true, error: null });

    // Always update localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    } catch {}

    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ isSaving: false, hasUnsavedChanges: false });
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          {
            key: 'homepage_layout',
            value: current,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );

      if (error) throw error;

      set({ isSaving: false, hasUnsavedChanges: false });
      return { success: true };
    } catch (err: any) {
      set({ isSaving: false, error: err.message });
      return { success: false, error: err.message };
    }
  },

  toggleHero: () => {
    set((state) => ({
      layout: {
        ...state.layout,
        hero_enabled: !state.layout.hero_enabled,
      },
      hasUnsavedChanges: true,
    }));
  },

  toggleSection: (id: HomeSectionId) => {
    set((state) => ({
      layout: {
        ...state.layout,
        sections: state.layout.sections.map((sec) =>
          sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
        ),
      },
      hasUnsavedChanges: true,
    }));
  },

  moveSection: (fromIndex: number, toIndex: number) => {
    set((state) => {
      if (
        fromIndex < 0 ||
        fromIndex >= state.layout.sections.length ||
        toIndex < 0 ||
        toIndex >= state.layout.sections.length
      ) {
        return state;
      }

      const updated = [...state.layout.sections];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      return {
        layout: {
          ...state.layout,
          sections: updated,
        },
        hasUnsavedChanges: true,
      };
    });
  },

  setSections: (sections: HomeSectionConfig[]) => {
    set((state) => ({
      layout: {
        ...state.layout,
        sections,
      },
      hasUnsavedChanges: true,
    }));
  },

  applyPreset: (preset: 'rich' | 'focus' | 'default') => {
    set((state) => {
      if (preset === 'rich') {
        return {
          layout: {
            hero_enabled: true,
            sections: state.layout.sections.map((s) => ({ ...s, enabled: true })),
          },
          hasUnsavedChanges: true,
        };
      }

      if (preset === 'focus') {
        return {
          layout: {
            hero_enabled: true,
            sections: state.layout.sections.map((s) => ({
              ...s,
              enabled: s.id === 'featured_products',
            })),
          },
          hasUnsavedChanges: true,
        };
      }

      // Default
      return {
        layout: DEFAULT_HOMEPAGE_LAYOUT,
        hasUnsavedChanges: true,
      };
    });
  },
}));

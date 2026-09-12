import { create } from 'zustand';
import { LookbookCollection, LookbookMedia } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';

const DEFAULT_LOOKBOOK: LookbookCollection[] = [
  {
    id: 'lb-col-01',
    title: '2026 Campaign Lookbook',
    slug: '2026-campaign-lookbook',
    subtitle: 'Editorial Lookbook 2026',
    description: 'An exploration of form, shadow, and architectural silhouettes captured across international metropolises.',
    cover_image_url: '/assets/images/lookbook1.jpg',
    published: true,
    featured: true,
    sort_order: 1,
    media: [
      {
        id: 'm-1',
        lookbook_id: 'lb-col-01',
        media_url: '/assets/images/lookbook1.jpg',
        media_type: 'image',
        caption: 'CERVULA ARCHITECTURE — Milan Studio Editorial',
        sort_order: 1,
      },
      {
        id: 'm-2',
        lookbook_id: 'lb-col-01',
        media_url: '/assets/images/campaign_hero1.jpg',
        media_type: 'image',
        caption: 'SOLAR DUSK — Amber Shades 04 under golden hour solar reflections',
        sort_order: 2,
      },
      {
        id: 'm-3',
        lookbook_id: 'lb-col-01',
        media_url: '/assets/images/lookbook2.jpg',
        media_type: 'image',
        caption: 'DUAL SYMMETRY — Anak Jujur 02 two-tone harmony in architectural studio context',
        sort_order: 3,
      },
      {
        id: 'm-4',
        lookbook_id: 'lb-col-01',
        media_url: '/assets/images/lookbook3.jpg',
        media_type: 'image',
        caption: 'TRANSLUCENT SILENCE — Stealth Clear 03 ultra-light crystal polymer series',
        sort_order: 4,
      },
      {
        id: 'm-5',
        lookbook_id: 'lb-col-01',
        media_url: '/assets/images/campaign_hero2.jpg',
        media_type: 'image',
        caption: 'CYBER SHIFT — Cyberpulse 05 alloy aerodynamics in nocturnal Tokyo',
        sort_order: 5,
      },
      {
        id: 'm-6',
        lookbook_id: 'lb-col-01',
        media_url: '/assets/images/lookbook4.jpg',
        media_type: 'image',
        caption: 'LINEAR MONO — Helix Mono 06 titanium precision frame study',
        sort_order: 6,
      },
    ],
  },
];

interface LookbookState {
  collections: LookbookCollection[];
  isLoading: boolean;
  error: string | null;

  loadLookbook: () => Promise<void>;
  getCollectionById: (id: string) => LookbookCollection | undefined;
  createCollection: (col: Omit<LookbookCollection, 'id' | 'created_at' | 'updated_at' | 'media'>, media?: Omit<LookbookMedia, 'id' | 'lookbook_id'>[]) => Promise<{ success: boolean; data?: LookbookCollection; error?: string }>;
  updateCollection: (id: string, col: Partial<LookbookCollection>, media?: LookbookMedia[]) => Promise<{ success: boolean; error?: string }>;
  deleteCollection: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useLookbookStore = create<LookbookState>((set, get) => ({
  collections: DEFAULT_LOOKBOOK,
  isLoading: false,
  error: null,

  loadLookbook: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ collections: DEFAULT_LOOKBOOK, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data: cols, error: colError } = await supabase
        .from('lookbook_collections')
        .select('*')
        .order('sort_order', { ascending: true });

      if (colError) throw colError;

      if (cols && cols.length > 0) {
        const { data: mediaItems, error: mediaError } = await supabase
          .from('lookbook_media')
          .select('*')
          .order('sort_order', { ascending: true });

        if (mediaError) console.warn('Error fetching lookbook media:', mediaError);

        const joined: LookbookCollection[] = cols.map((col: any) => ({
          ...col,
          media: (mediaItems || []).filter((m: any) => m.lookbook_id === col.id),
        }));

        set({ collections: joined, isLoading: false });
      } else {
        set({ collections: DEFAULT_LOOKBOOK, isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load lookbook from Supabase:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  getCollectionById: (id: string) => {
    return get().collections.find((c) => c.id === id);
  },

  createCollection: async (colData, mediaItems = []) => {
    const supabase = getSupabaseClient();
    const newId = `col-${Date.now()}`;
    const newCollection: LookbookCollection = {
      ...colData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media: mediaItems.map((m, idx) => ({
        ...m,
        id: `m-${Date.now()}-${idx}`,
        lookbook_id: newId,
        sort_order: idx + 1,
      })),
    };

    if (!supabase) {
      const updated = [...get().collections, newCollection];
      set({ collections: updated });
      return { success: true, data: newCollection };
    }

    try {
      const { data: insertedCol, error: colErr } = await supabase
        .from('lookbook_collections')
        .insert([colData])
        .select()
        .single();

      if (colErr) throw colErr;

      let savedMedia: LookbookMedia[] = [];
      if (mediaItems.length > 0) {
        const mediaPayload = mediaItems.map((m, idx) => ({
          lookbook_id: insertedCol.id,
          media_url: m.media_url,
          media_type: m.media_type,
          caption: m.caption,
          sort_order: m.sort_order ?? idx + 1,
        }));

        const { data: insertedMedia, error: mediaErr } = await supabase
          .from('lookbook_media')
          .insert(mediaPayload)
          .select();

        if (mediaErr) console.error('Failed to insert lookbook media:', mediaErr);
        savedMedia = insertedMedia || [];
      }

      const fullCol: LookbookCollection = {
        ...insertedCol,
        media: savedMedia,
      };

      const updated = [...get().collections, fullCol];
      set({ collections: updated });
      return { success: true, data: fullCol };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateCollection: async (id, colUpdates, mediaList) => {
    const current = get().collections;
    const existing = current.find((c) => c.id === id);
    if (!existing) return { success: false, error: 'Collection not found' };

    const updatedCol: LookbookCollection = {
      ...existing,
      ...colUpdates,
      media: mediaList || existing.media,
      updated_at: new Date().toISOString(),
    };

    const optimistic = current.map((c) => (c.id === id ? updatedCol : c));
    set({ collections: optimistic });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error: colErr } = await supabase
        .from('lookbook_collections')
        .update({
          ...colUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (colErr) throw colErr;

      if (mediaList) {
        // Replace media
        await supabase.from('lookbook_media').delete().eq('lookbook_id', id);
        if (mediaList.length > 0) {
          const payload = mediaList.map((m, idx) => ({
            lookbook_id: id,
            media_url: m.media_url,
            media_type: m.media_type,
            caption: m.caption,
            sort_order: m.sort_order ?? idx + 1,
          }));
          await supabase.from('lookbook_media').insert(payload);
        }
      }

      return { success: true };
    } catch (err: any) {
      set({ collections: current });
      return { success: false, error: err.message };
    }
  },

  deleteCollection: async (id) => {
    const current = get().collections;
    const filtered = current.filter((c) => c.id !== id);
    set({ collections: filtered });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('lookbook_collections').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      set({ collections: current });
      return { success: false, error: err.message };
    }
  },
}));

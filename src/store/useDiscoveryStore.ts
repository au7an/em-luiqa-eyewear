import { create } from 'zustand';
import { FrameShape, FaceShape, Occasion } from '../types/database';
import { DEFAULT_FRAME_SHAPES, DEFAULT_FACE_SHAPES, DEFAULT_OCCASIONS } from '../constants/discovery';
import { getSupabaseClient } from '../lib/supabase';

interface DiscoveryState {
  frameShapes: FrameShape[];
  faceShapes: FaceShape[];
  occasions: Occasion[];
  isLoading: boolean;
  error: string | null;

  loadTaxonomy: () => Promise<void>;

  // Frame Shapes
  createFrameShape: (data: Omit<FrameShape, 'created_at'>) => Promise<{ success: boolean; data?: FrameShape; error?: string }>;
  updateFrameShape: (id: string, updates: Partial<FrameShape>) => Promise<{ success: boolean; error?: string }>;
  deleteFrameShape: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Face Shapes
  createFaceShape: (data: Omit<FaceShape, 'created_at'>) => Promise<{ success: boolean; data?: FaceShape; error?: string }>;
  updateFaceShape: (id: string, updates: Partial<FaceShape>) => Promise<{ success: boolean; error?: string }>;
  deleteFaceShape: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Occasions
  createOccasion: (data: Omit<Occasion, 'created_at'>) => Promise<{ success: boolean; data?: Occasion; error?: string }>;
  updateOccasion: (id: string, updates: Partial<Occasion>) => Promise<{ success: boolean; error?: string }>;
  deleteOccasion: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
  frameShapes: DEFAULT_FRAME_SHAPES,
  faceShapes: DEFAULT_FACE_SHAPES,
  occasions: DEFAULT_OCCASIONS,
  isLoading: false,
  error: null,

  loadTaxonomy: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({
        frameShapes: DEFAULT_FRAME_SHAPES,
        faceShapes: DEFAULT_FACE_SHAPES,
        occasions: DEFAULT_OCCASIONS,
        isLoading: false,
      });
      return;
    }

    try {
      set({ isLoading: true, error: null });

      const [shapesRes, facesRes, occsRes] = await Promise.all([
        supabase.from('frame_shapes').select('*').order('sort_order', { ascending: true }),
        supabase.from('face_shapes').select('*').order('sort_order', { ascending: true }),
        supabase.from('occasions').select('*').order('sort_order', { ascending: true }),
      ]);

      set({
        frameShapes: shapesRes.data && shapesRes.data.length > 0 ? shapesRes.data : DEFAULT_FRAME_SHAPES,
        faceShapes: facesRes.data && facesRes.data.length > 0 ? facesRes.data : DEFAULT_FACE_SHAPES,
        occasions: occsRes.data && occsRes.data.length > 0 ? occsRes.data : DEFAULT_OCCASIONS,
        isLoading: false,
      });
    } catch (err: any) {
      console.warn('Failed to load discovery taxonomy, using defaults:', err);
      set({
        frameShapes: DEFAULT_FRAME_SHAPES,
        faceShapes: DEFAULT_FACE_SHAPES,
        occasions: DEFAULT_OCCASIONS,
        isLoading: false,
      });
    }
  },

  // --------------------------------------------------------------------------
  // FRAME SHAPES
  // --------------------------------------------------------------------------
  createFrameShape: async (data) => {
    const newShape: FrameShape = {
      ...data,
      id: data.id || `shape-${Date.now().toString().slice(-4)}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      created_at: new Date().toISOString(),
    };

    const current = get().frameShapes;
    set({ frameShapes: [...current, newShape] });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true, data: newShape };

    try {
      const { data: inserted, error } = await supabase.from('frame_shapes').insert([newShape]).select().single();
      if (error) throw error;
      return { success: true, data: inserted };
    } catch (err: any) {
      set({ frameShapes: current });
      return { success: false, error: err.message };
    }
  },

  updateFrameShape: async (id, updates) => {
    const current = get().frameShapes;
    const updated = current.map((s) => (s.id === id ? { ...s, ...updates } : s));
    set({ frameShapes: updated });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('frame_shapes').update(updates).eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      set({ frameShapes: current });
      return { success: false, error: err.message };
    }
  },

  deleteFrameShape: async (id) => {
    const current = get().frameShapes;
    set({ frameShapes: current.filter((s) => s.id !== id) });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('frame_shapes').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      set({ frameShapes: current });
      return { success: false, error: err.message };
    }
  },

  // --------------------------------------------------------------------------
  // FACE SHAPES
  // --------------------------------------------------------------------------
  createFaceShape: async (data) => {
    const newFace: FaceShape = {
      ...data,
      id: data.id || `face-${Date.now().toString().slice(-4)}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      created_at: new Date().toISOString(),
    };

    const current = get().faceShapes;
    set({ faceShapes: [...current, newFace] });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true, data: newFace };

    try {
      const { data: inserted, error } = await supabase.from('face_shapes').insert([newFace]).select().single();
      if (error) throw error;
      return { success: true, data: inserted };
    } catch (err: any) {
      set({ faceShapes: current });
      return { success: false, error: err.message };
    }
  },

  updateFaceShape: async (id, updates) => {
    const current = get().faceShapes;
    const updated = current.map((f) => (f.id === id ? { ...f, ...updates } : f));
    set({ faceShapes: updated });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('face_shapes').update(updates).eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      set({ faceShapes: current });
      return { success: false, error: err.message };
    }
  },

  deleteFaceShape: async (id) => {
    const current = get().faceShapes;
    set({ faceShapes: current.filter((f) => f.id !== id) });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('face_shapes').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      set({ faceShapes: current });
      return { success: false, error: err.message };
    }
  },

  // --------------------------------------------------------------------------
  // OCCASIONS
  // --------------------------------------------------------------------------
  createOccasion: async (data) => {
    const newOcc: Occasion = {
      ...data,
      id: data.id || `occ-${Date.now().toString().slice(-4)}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      created_at: new Date().toISOString(),
    };

    const current = get().occasions;
    set({ occasions: [...current, newOcc] });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true, data: newOcc };

    try {
      const { data: inserted, error } = await supabase.from('occasions').insert([newOcc]).select().single();
      if (error) throw error;
      return { success: true, data: inserted };
    } catch (err: any) {
      set({ occasions: current });
      return { success: false, error: err.message };
    }
  },

  updateOccasion: async (id, updates) => {
    const current = get().occasions;
    const updated = current.map((o) => (o.id === id ? { ...o, ...updates } : o));
    set({ occasions: updated });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('occasions').update(updates).eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      set({ occasions: current });
      return { success: false, error: err.message };
    }
  },

  deleteOccasion: async (id) => {
    const current = get().occasions;
    set({ occasions: current.filter((o) => o.id !== id) });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('occasions').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      set({ occasions: current });
      return { success: false, error: err.message };
    }
  },
}));

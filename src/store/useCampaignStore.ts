import { create } from 'zustand';
import { Campaign } from '../types/database';
import { getSupabaseClient } from '../lib/supabase';

const DEFAULT_CAMPAIGNS: Campaign[] = [
  {
    id: 'c-01',
    name: '2026 Solar Collection Video',
    eyebrow: 'Summer Campaign',
    title: '2026 SOLAR COLLECTION',
    description: 'Sculptural tinted frames engineered for high solar radiation and statement presence.',
    desktop_media_url: '/assets/videos/slide_1.mp4',
    mobile_media_url: '/assets/images/campaign_slide_1.jpg',
    media_type: 'video',
    primary_cta_label: 'Shop Now',
    primary_cta_url: '/catalog?category=sunglasses',
    secondary_cta_label: 'View Campaign',
    secondary_cta_url: '/lookbook',
    object_position_desktop: 'center',
    object_position_mobile: 'center',
    autoplay_duration: 6000,
    sort_order: 1,
    active: true,
  },
  {
    id: 'c-02',
    name: '2026 Global Studio Campaign',
    eyebrow: 'Studio Series',
    title: '2026 GLOBAL CAMPAIGN',
    description: 'International avant-garde eyewear carved from cured Italian cellulose acetate.',
    desktop_media_url: '/assets/images/campaign_slide_2.jpg',
    mobile_media_url: '/assets/images/campaign_slide_2.jpg',
    media_type: 'image',
    primary_cta_label: 'Shop Now',
    primary_cta_url: '/catalog',
    secondary_cta_label: 'View Campaign',
    secondary_cta_url: '/lookbook',
    object_position_desktop: 'center',
    object_position_mobile: 'center',
    autoplay_duration: 6000,
    sort_order: 2,
    active: true,
  },
  {
    id: 'c-03',
    name: '2026 Optical Precision Collection',
    eyebrow: 'Optical Laboratory',
    title: '2026 OPTICAL COLLECTION',
    description: 'Featherweight structural silhouettes with multi-coat anti-reflective technology.',
    desktop_media_url: '/assets/images/campaign_slide_3.jpg',
    mobile_media_url: '/assets/images/campaign_slide_3.jpg',
    media_type: 'image',
    primary_cta_label: 'Shop Now',
    primary_cta_url: '/catalog?category=optical',
    secondary_cta_label: 'View Campaign',
    secondary_cta_url: '/lookbook',
    object_position_desktop: 'center',
    object_position_mobile: 'center',
    autoplay_duration: 6000,
    sort_order: 3,
    active: true,
  },
];

interface CampaignState {
  campaigns: Campaign[];
  activeCampaigns: Campaign[];
  isLoading: boolean;
  error: string | null;

  loadCampaigns: () => Promise<void>;
  loadActiveCampaigns: () => Promise<void>;
  getCampaignById: (id: string) => Campaign | undefined;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; data?: Campaign; error?: string }>;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => Promise<{ success: boolean; error?: string }>;
  deleteCampaign: (id: string) => Promise<{ success: boolean; error?: string }>;
  reorderCampaigns: (orderedIds: string[]) => Promise<void>;
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: DEFAULT_CAMPAIGNS,
  activeCampaigns: DEFAULT_CAMPAIGNS,
  isLoading: false,
  error: null,

  loadCampaigns: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ campaigns: DEFAULT_CAMPAIGNS, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        set({ campaigns: data, isLoading: false });
      } else {
        set({ campaigns: DEFAULT_CAMPAIGNS, isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load all campaigns:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  loadActiveCampaigns: async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      set({ activeCampaigns: DEFAULT_CAMPAIGNS, isLoading: false });
      return;
    }

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Filter by dates if set
        const filtered = data.filter((c) => {
          if (c.start_date && new Date(c.start_date) > new Date(now)) return false;
          if (c.end_date && new Date(c.end_date) < new Date(now)) return false;
          return true;
        });

        set({
          activeCampaigns: filtered.length > 0 ? filtered : data,
          isLoading: false,
        });
      } else {
        set({ activeCampaigns: DEFAULT_CAMPAIGNS, isLoading: false });
      }
    } catch (err: any) {
      console.warn('Failed to load active campaigns from Supabase:', err);
      set({ activeCampaigns: DEFAULT_CAMPAIGNS, isLoading: false });
    }
  },

  getCampaignById: (id: string) => {
    return get().campaigns.find((c) => c.id === id);
  },

  createCampaign: async (campaignData) => {
    const supabase = getSupabaseClient();
    const newId = `c-${Date.now()}`;
    const newCampaign: Campaign = {
      ...campaignData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!supabase) {
      const updated = [...get().campaigns, newCampaign];
      set({ campaigns: updated });
      return { success: true, data: newCampaign };
    }

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single();

      if (error) throw error;

      const updated = [...get().campaigns, data];
      set({ campaigns: updated });
      get().loadActiveCampaigns();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  updateCampaign: async (id, updatedFields) => {
    const current = get().campaigns;
    const optimistic = current.map((c) => (c.id === id ? { ...c, ...updatedFields, updated_at: new Date().toISOString() } : c));
    set({ campaigns: optimistic });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ ...updatedFields, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      get().loadActiveCampaigns();
      return { success: true };
    } catch (err: any) {
      // rollback
      set({ campaigns: current });
      return { success: false, error: err.message };
    }
  },

  deleteCampaign: async (id) => {
    const current = get().campaigns;
    const filtered = current.filter((c) => c.id !== id);
    set({ campaigns: filtered });

    const supabase = getSupabaseClient();
    if (!supabase) return { success: true };

    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw error;

      get().loadActiveCampaigns();
      return { success: true };
    } catch (err: any) {
      set({ campaigns: current });
      return { success: false, error: err.message };
    }
  },

  reorderCampaigns: async (orderedIds) => {
    const current = get().campaigns;
    const reordered = orderedIds
      .map((id, index) => {
        const item = current.find((c) => c.id === id);
        return item ? { ...item, sort_order: index + 1 } : null;
      })
      .filter(Boolean) as Campaign[];

    set({ campaigns: reordered });

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await Promise.all(
          reordered.map((c) =>
            supabase.from('campaigns').update({ sort_order: c.sort_order }).eq('id', c.id)
          )
        );
      } catch (err) {
        console.error('Failed to update campaign sort orders:', err);
      }
    }
  },
}));
